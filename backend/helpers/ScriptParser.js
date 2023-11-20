const Models = require('../models');
const Sequelize = require('sequelize');
const { Op, Model } = require('sequelize');
const safeEval = require('safe-eval');
const util = require('util');
const { ceil } = require('lodash');
const {
  sequelize,
  MemberEligibilities,
  Member,
  SurveyQuestion,
  Survey,
  SurveyAnswerPrecodes,
  SurveyQualification,
  SurveyProvider,
  MemberTransaction,
} = require('../models/index');
const axios = require('axios');
const { json } = require('body-parser');
const { required } = require('joi');
class ScriptParser {
  constructor() {
    this.parseScript = this.parseScript.bind(this);
    this.getModuleWhere = this.getModuleWhere.bind(this);
    this.getSurveys = this.getSurveys.bind(this);
    this.instance = axios.create({
      baseURL: this.baseUrl,
    });
    // this.getOfferWallList = this.getOfferWallList.bind(this);
    // this.getTicketList = this.getTicketList.bind(this);
  }
  async parseScript(script_id, user, params, req) {
    var data = [];
    const client_timezone =
      'timezone' in params
        ? params.timezone
        : Intl.DateTimeFormat().resolvedOptions().timeZone;
    var other_details = {
      transaction_count: 0,
      total_withdrawal_amount: 0,
      member_balance: 0,
      user: user,
      message: '',
      timezone: client_timezone,
    };

    var page_count = 0;
    var script_html = '';
    let script = await Models.Script.findOne({ where: { code: script_id } });
    const pageNo = 'pageno' in params ? parseInt(params.pageno) : 1;

    if (script) {
      script_html = script.script_html;
      if (script.module) {
        switch (script.action_type) {
          case 'list':
            const perPage = 'perpage' in params ? parseInt(params.perpage) : 12;
            const orderBy = 'orderby' in params ? params.orderby : 'id';
            const order = 'order' in params ? params.order : 'desc';
            let onprofilecomplete =
              'onprofilecomplete' in params ? params.onprofilecomplete : false;
            var profile_completed = true;
            if (onprofilecomplete === 'true' && !user.profile_completed_on) {
              profile_completed = false;
            }
            if (profile_completed) {
              const param_where =
                'where' in params ? JSON.parse(params.where) : null;

              // other_details = {
              //     ...other_details,
              //     conditions:param_where
              // };
              let where = this.getModuleWhere(script.module, user);
              if (param_where)
                where.where = {
                  ...where.where,
                  ...param_where,
                };
              // console.log('where', where);
              data = await Models[script.module].findAll({
                subQuery: false,
                order: [[Sequelize.literal(orderBy), order]],
                limit: perPage,
                offset: (pageNo - 1) * perPage,
                ...where,
                // logging: console.log,
              });
              if (script.module == 'Shoutbox') {
                data = data.reverse();
              }
              // To format Earning history list to manipulate withdrawal data
              if (script.module == 'MemberTransaction') {
                data.forEach(function (transaction, key) {
                  if (
                    ['withdrawal', 'Withdrawal'].includes(
                      transaction.amount_action
                    ) ||
                    transaction.status == 5
                  ) {
                    var status_arr = [3, 4];
                    if (transaction.status == 3 || transaction.status == 4) {
                      data[key].setDataValue(transaction.status, 'pending');
                      transaction.status = 'pending';
                      data[key].setDataValue(
                        'transaction_status_display',
                        'pending'
                      );
                    }
                    if (
                      transaction.parent_transaction_id &&
                      transaction.status == 2
                    ) {
                      data[key].setDataValue(
                        transaction.status,
                        transaction.ParentTransaction.status
                      );
                      transaction.status = transaction.ParentTransaction.status;
                      data[key].setDataValue(
                        'transaction_status_display',
                        transaction.ParentTransaction.status
                      );
                    }
                    if (transaction.status == 1) {
                      data[key].setDataValue(
                        transaction.status,
                        transaction.WithdrawalRequest.status
                      );
                      transaction.status = transaction.WithdrawalRequest.status;
                      data[key].setDataValue(
                        'transaction_status_display',
                        transaction.WithdrawalRequest.status
                      );
                    }

                    if (
                      transaction.status == 5 &&
                      transaction.type === 'credited'
                    ) {
                      // console.log('transaction_status_display reversal', 2);
                      data[key].setDataValue(transaction.status, 2);
                      transaction.status = 2;
                      data[key].setDataValue('transaction_status_display', 2);
                    }
                  }
                });
              }

              var data_count = await Models[script.module].findAndCountAll({
                ...where,
              });
              page_count = Math.ceil(data_count.count / perPage);

              if (script.module == 'MemberReferral') {
                let total = await Models.MemberReferral.findOne({
                  attributes: [
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
                  ],
                  where: { member_id: user.id },
                });
                other_details = {
                  ...other_details,
                  ...JSON.parse(JSON.stringify(total)),
                };
              }

              //pagination
              if (
                'pagination' in params &&
                params.pagination === 'true' &&
                page_count > 1
              ) {
                script_html = await this.appendPaginationNew(
                  script_html,
                  script_id,
                  pageNo,
                  page_count
                );
              }
            }
            break;
          case 'profile_update':
            const member_where = this.getModuleWhere(script.module, user);
            data = await Models[script.module].findOne({
              ...member_where,
            });
            let email_alerts = await Models.EmailAlert.getEmailAlertList(
              user.id
            );
            data.setDataValue('email_alerts', email_alerts);
            let country_list = await Models.Country.getAllCountryList();
            data.setDataValue('country_list', country_list);
            var clause = {};
            if (user.country_id) {
              clause.where = {
                country_id: user.country_id,
              };
            }
            let state_list = await Models.State.getAllStates(clause);
            data.setDataValue('state_list', state_list);
            break;
          case 'member_withdrawal':
            let transaction_data = {};
            let transaction_completed_at = JSON.parse(
              JSON.stringify(
                await Models.MemberTransaction.findOne({
                  where: {
                    member_id: user.id,
                    status: 1,
                    amount_action: 'member_withdrawal',
                  },
                  attributes: [['completed_at', 'completed_datetime']],
                  order: [['id', 'DESC']],
                })
              )
            );
            let transactions = JSON.parse(
              JSON.stringify(
                await Models.MemberTransaction.findOne({
                  where: {
                    member_id: user.id,
                    status: 2,
                    amount_action: 'member_withdrawal',
                  },
                  attributes: [
                    [
                      sequelize.literal(`(SELECT COUNT(id))`),
                      'transaction_count',
                    ],
                    [
                      sequelize.literal(`(SELECT SUM(amount))`),
                      'total_withdrawal_amount',
                    ],
                  ],
                  order: [['id', 'ASC']],
                })
              )
            );
            let balances = JSON.parse(
              JSON.stringify(
                await Models.MemberBalance.findOne({
                  where: {
                    member_id: user.id,
                    amount_type: 'cash',
                  },
                  attributes: [['amount', 'member_balance']],
                })
              )
            );

            transaction_data = {
              completed_at: transaction_completed_at
                ? transaction_completed_at.completed_at
                : null,
              transaction_count: transactions.transaction_count,
              total_withdrawal_amount: transactions.total_withdrawal_amount,
              member_balance: balances.member_balance,
            };
            other_details = {
              ...other_details,
              ...JSON.parse(JSON.stringify(transaction_data)),
            };

            const condition = this.getModuleWhere(script.module, user);

            data = await Models[script.module].findAll(condition);

            // var total_unapproved_withdrawal_amount = 0;
            let pending_withdrawal_req_amount =
              await Models.WithdrawalRequest.findOne({
                attributes: [
                  [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
                  [sequelize.fn('COUNT', sequelize.col('id')), 'total_count'],
                ],
                where: {
                  status: 'pending',
                  member_id: user.id,
                },
              });
            other_details.total_unapproved_withdrawal_amount =
              pending_withdrawal_req_amount.dataValues.total;
            other_details.total_unapproved_withdrawal_count =
              pending_withdrawal_req_amount.dataValues.total_count;
            // console.log(other_details);
            data.forEach(function (payment, key) {
              // payment.WithdrawalRequests.forEach(function (requests, key) {
              //   if (
              //     ['pending', 'approved'].includes(requests.dataValues.status)
              //   ) {
              //     total_unapproved_withdrawal_amount += requests.amount;
              //   }
              // });
              var date1 = new Date();
              const withdraw_redo_interval = payment.withdraw_redo_interval;
              data[key].setDataValue(
                'redo_diff',
                parseFloat(payment.withdraw_redo_interval)
              );
              data[key].setDataValue('redo_diff_calculation', 0);
              if (withdraw_redo_interval > 0) {
                var date2 = new Date();

                if (payment.WithdrawalRequests.length > 0) {
                  var date2 = new Date(
                    payment.WithdrawalRequests[0].created_at
                  );
                  var hours = (Math.abs(date2 - date1) / 36e5).toFixed(2);
                  data[key].setDataValue('redo_diff', parseFloat(hours));
                  data[key].setDataValue(
                    'redo_diff_calculation',
                    parseFloat(withdraw_redo_interval) - parseFloat(hours)
                  );
                }
              }
              var past_withdrawal_symbol = '';
              switch (payment.past_withdrawal_options) {
                case 'At least':
                  past_withdrawal_symbol = '>=';
                  break;
                case 'At most':
                  past_withdrawal_symbol = '<=';
                  break;
                case 'Exact':
                  past_withdrawal_symbol = '==';
                  break;
                default:
                  past_withdrawal_symbol = '>=';
                  break;
              }

              data[key].setDataValue(
                'past_withdrawal_symbol',
                past_withdrawal_symbol
              );
            });

            break;
          case 'survey':
            const survey = 'survey' in params ? params.survey : '1';
            let temp_survey_list = await this.getSurveys(
              user,
              survey,
              script.module,
              params,
              req
            );

            if (temp_survey_list.status) {
              data = temp_survey_list.result.surveys;
              page_count = temp_survey_list.result.page_count;
            } else {
              data = [];
              other_details.message = temp_survey_list.message;
            }
            if (page_count > 5) {
              page_count = 5;
            }
            //pagination
            if (
              'pagination' in params &&
              params.pagination === 'true' &&
              page_count > 1
            ) {
              script_html = await this.appendPagination(
                script_html,
                script_id,
                pageNo,
                page_count
              );
            }
            break;
        }
      }
    }
    // console.log(JSON.parse(JSON.stringify(data)));
    return {
      data: JSON.parse(JSON.stringify(data)),
      script_html,
      page_count,
      other_details: JSON.parse(JSON.stringify(other_details)),
    };
  }
  //get all matched surveys
  //get survey
  async getSurveys(user, survey_provider_id, script_module, params, req) {
    let memberId = user.id;
    if (!memberId) {
      return {
        status: false,
        message: 'Member id not found!',
        surveys: [],
      };
    }
    const provider = await SurveyProvider.findOne({
      attributes: ['id'],
      where: {
        id: survey_provider_id,
      },
    });
    if (!provider) {
      return {
        status: false,
        message: 'Survey provider not found!',
        surveys: [],
      };
    }
    //check provider name
    let file_name = '';
    switch (survey_provider_id) {
      case '1':
        file_name = 'LucidController';
        break;
      case '2':
        file_name = 'CintController';
        break;
      case '3':
        file_name = 'PureSpectrumController';
        break;
      case '4':
        file_name = 'SchlesingerController';
        break;
      case '6':
        file_name = 'TolunaController';
      default:
        break;
    }
    const ProviderControllerClass = require(`../controllers/frontend/${file_name}`);
    const ProviderController = new ProviderControllerClass();
    let response = await ProviderController.surveys(memberId, params, req);
    return response;
  }
  getModuleWhere(module, user) {
    switch (module) {
      case 'Ticket':
        return { where: { member_id: user.id } };

      case 'MemberTransaction':
        return {
          where: user
            ? { member_id: user.id }
            : {
                status: 2,
                type: 'withdraw',
                amount_action: { [Op.ne]: 'reversed_transaction' },
              },
          include: [
            { model: Models.Member, required: true },
            {
              model: Models.WithdrawalRequest,
              required: user ? false : true,
              where: {
                // status: ['approved', 'pending', 'completed'],
              },
              include: {
                model: Models.PaymentMethod,
              },
            },
            {
              model: Models.MemberTransaction,
              as: 'ParentTransaction',
              attributes: ['member_id', 'status', 'created_at'],
              include: [
                {
                  model: Models.Member,
                  required: false,
                  attributes: ['id', 'first_name', 'last_name', 'username'],
                },
                {
                  model: Models.WithdrawalRequest,
                  // required: user ? false : true,
                  // where: {
                  //   status: ['approved', 'pending', 'completed'],
                  // },
                  include: {
                    model: Models.PaymentMethod,
                  },
                },
              ],
            },
          ],
          attributes: [
            'created_at',
            'id',
            'amount',
            'status',
            'amount_action',
            'currency',
            'balance',
            'transaction_id',
            'type',
            [Sequelize.literal('Member.avatar'), 'avatar'],
            [Sequelize.literal('Member.username'), 'username'],
            'note',
            'parent_transaction_id',
            'created_at',
          ],
        };
      case 'Member':
        return {
          where: { id: user.id },
          include: {
            model: Models.MembershipTier,
            attributes: ['name'],
          },
        };
      case 'Shoutbox':
        return {
          attributes: ['verbose', 'created_at'],
          include: { model: Models.Member, attributes: ['username'] },
        };
      case 'MemberReferral':
        return {
          include: [
            {
              model: Models.Member,
              // as: 'member_referrer',
              include: {
                model: Models.MemberActivityLog,
                attributes: ['created_at'],
                limit: 1,
                order: [['created_at', 'DESC']],
              },
            },
          ],
          where: {
            member_id: user.id,
          },
        };
      case 'PaymentMethod':
        return {
          attributes: [
            'name',
            'slug',
            'id',
            'image_url',
            'type_user_info_again',
            'past_withdrawal_options',
            'minimum_amount',
            'maximum_amount',
            'fixed_amount',
            'type_user_info_again',
            'withdraw_redo_interval',
            'past_withdrawal_count',
            'payment_type',
            [
              sequelize.literal(
                `(select count(*) from excluded_member_payment_method where payment_method_id = PaymentMethod.id and member_id = ` +
                  user.id +
                  `)`
              ),
              'disallowed',
            ],
            [
              sequelize.literal(
                `(select count(*) from allowed_country_payment_method where payment_method_id = PaymentMethod.id and country_id = ` +
                  user.country_id +
                  `)`
              ),
              'allowed_country',
            ],
          ],
          where: { company_portal_id: user.company_portal_id, status: 1 },
          order: [
            [Models.WithdrawalRequest, 'id', 'DESC'],
            [Models.PaymentMethodFieldOption, 'id', 'ASC'],
          ],
          include: [
            {
              model: Models.PaymentMethodFieldOption,
              attributes: ['field_name', 'field_type'],
              required: false,
            },
            {
              model: Models.MemberPaymentInformation,
              attributes: ['name', 'value'],
              required: false,
              where: { status: 1, member_id: user.id },
            },
            {
              model: Models.WithdrawalRequest,
              attributes: [
                'id',
                'member_transaction_id',
                'created_at',
                'requested_on',
                'status',
                'amount',
              ],
              required: false,
              where: { member_id: user.id },
              include: {
                model: Models.MemberTransaction,
                attributes: ['completed_at'],
                required: false,
              },
            },
          ],
        };
      case 'TicketConversation':
        return {
          attributes: ['message', 'member_id', 'user_id', 'created_at'],
          include: [
            {
              model: Models.TicketAttachment,
              attributes: ['file_name', 'mime_type', 'created_at'],
            },
            {
              model: Models.Member,
              attributes: ['first_name', 'last_name', 'username', 'avatar'],
            },
            {
              model: Models.User,
              attributes: ['first_name', 'last_name', 'alias_name', 'avatar'],
            },
            {
              model: Models.Ticket,
              attributes: ['status', 'id', 'subject'],
            },
          ],
        };
      case 'WithdrawalRequest':
        return {
          where: { member_id: user.id },
          include: [
            {
              model: Models.PaymentMethod,
              attributes: ['image_url', 'name'],
            },
            {
              model: Models.MemberTransaction,
              attributes: ['transaction_id'],
            },
          ],
        };
      case 'MemberNotification':
        return {
          where: { member_id: user.id },
        };
      case 'SurveyProvider':
        return {
          where: {
            status: 1,
          },
        };
      default:
        return { where: {} };
    }
  }
  //append pagination
  async appendPaginationNew(script_html, script_id, page_no, total_page_count) {
    var indx = 0;
    var start = page_no;
    const show = 3;
    if (page_no == 1 || total_page_count <= show) {
      start = 2;
    } else if (
      total_page_count > show &&
      (page_no === total_page_count || total_page_count - page_no <= show)
    ) {
      start = total_page_count - show;
    }

    script_html += `<div class="pagination-sec d-flex justify-content-center justify-content-md-end pb-2 pt-0 pb-xl-4 pt-xl-2 px-3 px-lg-4 rounded-bottom">
      <input type="hidden" id="filter_where">
      <nav aria-label="Page navigation example">
        <ul class="pagination mb-0">`;
    if (page_no > 1) {
      script_html += `
            <li class="page-item" data-page="${page_no - 1}">
              <a href="javascript:void(0)" aria-label="Previous" class="page-link"><svg fill="#D6D6D6" width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 16 16" class="bi bi-chevron-left">
              <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" fill-rule="evenodd">
              </path>
              </svg></a>
            </li>`;
    }

    script_html += `
            <li data-page="1" class="page-item ${
              1 === page_no ? 'active' : ''
            }" data-id="${script_id}-1">
              <a href="javascript:void(0)" class="page-link">1</a>
            </li>
        `;
    if (page_no > show) {
      script_html += `
            <li data-page="2" class="page-item ${
              2 === page_no ? 'active' : ''
            }" data-id="${script_id}-2">
              <a href="javascript:void(0)" class="page-link">2</a>
            </li>
        `;
    }
    if (page_no >= show && total_page_count > show) {
      script_html += `<li><a href="javascript:void(0)" class="page-link pe-none">...</a></li>`;
    }

    for (let i = start; i <= total_page_count - 1; i++) {
      script_html += `
            <li data-page="${i}" class="page-item ${
        i === page_no ? 'active' : ''
      }" data-id="${script_id}-${i}">
              <a href="javascript:void(0)" class="page-link">${i}</a>
            </li>
          `;
      indx++;
      if (indx == show) {
        break;
      }
    }
    if (show + page_no < total_page_count) {
      script_html += `<li><a href="javascript:void(0)" class="page-link pe-none">...</a></li>`;
    }
    script_html += `
            <li data-page="${total_page_count}" class="page-item ${
      total_page_count === page_no ? 'active' : ''
    }" data-id="${script_id}-${total_page_count}">
              <a href="javascript:void(0)" class="page-link">${total_page_count}</a>
            </li>
        `;

    if (page_no !== total_page_count) {
      script_html += `<li class="page-item" data-page="${page_no + 1}">
            <a href="javascript:void(0)" aria-label="Next" class="page-link"><svg fill="#D6D6D6" width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 16 16" class="bi bi-chevron-right">
            <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" fill-rule="evenodd">
            </path>
            </svg></a>
          </li>`;
    }

    script_html += `</ul>
      </nav>
    </div>`;

    script_html += `<script>
	    $(document).ready(function () {
        $(document).on("click",".page-item",function(e) {
          e.stopImmediatePropagation();
          var page = $(this).data("page");
          var div_element = document.querySelector("[data-script='${script_id}']");
            $(div_element).data("pageno",page);
              callPagination(div_element);
            });
            function callPagination(element) {
              var dataAttrs = $(element).data();
              var filter_where = $("#filter_where").val();
              if("where" in dataAttrs){ dataAttrs.where =  isJson(dataAttrs.where)}
              var params = {pageno: 1,perpage: 10,orderby: null,order: null,script: "",member: null,...dataAttrs};
              $.ajax({
                url: '/get-scripts/',
                type: "GET",
                data: params,
                success: function (res) {
                  if (res.status) {
                    $(element).html(res.html);
                    if(filter_where){
                      filter_where = JSON.parse(filter_where);
                      Object.keys(filter_where).forEach(key => {
                        let filter_elem = "#"+key;
                        if($(filter_elem).is("input")){
                          $(filter_elem).val(filter_where[key]);
                        }else{
                          $(filter_elem).html(filter_where[key]);
                        }
                      });
                      $("#filter_where").val(JSON.stringify(filter_where));
                      let isFunction = typeof setFilters === 'function';
                      if(isFunction){
                        setFilters();
                      }
                  }
                  }
                }
              })
            }
            function isJson(str) {
              try {
                  JSON.parse(str);
              } catch (e) {
                  return JSON.stringify(str);
              }
              return str;
            }
          });
      </script>`;

    return script_html;
  }

  //append pagination
  async appendPagination(script_html, script_id, page_no, total_page_count) {
    script_html =
      script_html +
      `<div class="pagination-sec d-flex justify-content-center justify-content-md-end pb-2 pt-0 pb-xl-4 pt-xl-2 px-3 px-lg-4 rounded-bottom">\
      <input type="hidden" id="filter_where">\
    <nav aria-label="Page navigation example">\
      <ul class="pagination mb-0">\
      {{#ifCond '` +
      page_no +
      `' ">" '1'}}\
        <li class="page-item" data-page="{{cal ` +
      page_no +
      ` '-' 1}}">\
          <a href="javascript:void(0)" aria-label="Previous" class="page-link"><svg fill="#D6D6D6" width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 16 16" class="bi bi-chevron-left">\
          <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" fill-rule="evenodd">\
          </path>\
          </svg></a>\
        </li>\
      {{/ifCond}}
      {{#for 1 page_count 1}}\
        {{#ifCond this "==" '` +
      page_no +
      `'}}\
          <li data-page="{{this}}" class="page-item active" data-id="` +
      script_id +
      `-{{this}}">\
            <a href="javascript:void(0)" class="page-link">{{this}}</a>\
          </li>\
        {{/ifCond}}
        {{#ifCond this "!=" '` +
      page_no +
      `'}}\
          <li data-page="{{this}}" class="page-item" data-id="` +
      script_id +
      `-{{this}}">\
            <a href="javascript:void(0)" class="page-link">{{this}}</a>\
          </li>\
        {{/ifCond}}\
      {{/for}}\
      {{#ifCond '` +
      page_no +
      `' "!=" '` +
      total_page_count +
      `' }}\
        <li class="page-item" data-page="{{cal ` +
      page_no +
      ` '+' 1}}">\
          <a href="javascript:void(0)" aria-label="Next" class="page-link"><svg fill="#D6D6D6" width="16" xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 16 16" class="bi bi-chevron-right">\
          <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" fill-rule="evenodd">\
          </path>\
          </svg></a>\
        </li>\
      {{/ifCond}}
      </ul>\
    </nav>\
    </div>\
    <script>\
	    $(document).ready(function () {\
        $(document).on("click",".page-item",function(e) {\
          e.stopImmediatePropagation();\
          var page = $(this).data("page");\
          var div_element = document.querySelector("[data-script='` +
      script_id +
      `']");\
          $(div_element).data("pageno",page);\
          callPagination(div_element);\
        });\
        function callPagination(element) {\
          var dataAttrs = $(element).data();\
          var filter_where = $("#filter_where").val();\
          if("where" in dataAttrs){ dataAttrs.where =  isJson(dataAttrs.where)}\
          var params = {pageno: 1,perpage: 10,orderby: null,order: null,script: "",member: null,...dataAttrs};\
          $.ajax({\
            url: '/get-scripts/',\
            type: "GET",\
            data: params,\
            success: function (res) {\
              if (res.status) {\
                $(element).html(res.html);\
                if(filter_where){\
                  filter_where = JSON.parse(filter_where);
                  Object.keys(filter_where).forEach(key => {\
                    let filter_elem = "#"+key;\
                    if($(filter_elem).is("input")){\
                      $(filter_elem).val(filter_where[key]);\
                    }else{\
                      $(filter_elem).html(filter_where[key]);\
                    }\
                  });\
                  $("#filter_where").val(JSON.stringify(filter_where));\
                  let isFunction = typeof setFilters === 'function';\
                  if(isFunction){\
                    setFilters();\
                  }\
               }\
              }\
            }
          })\
        }\
        function isJson(str) {\
          try {\
              JSON.parse(str);\
          } catch (e) {\
              return JSON.stringify(str);\
          }\
          return str;\
        }\
      });\
  </script>`;
    return script_html;
  }
}
module.exports = ScriptParser;
