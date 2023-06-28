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
} = require('../models/index');
const axios = require('axios');
const { json } = require('body-parser');
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
  async parseScript(script_id, user, params) {
    var data = [];
    var other_details = {
      transaction_count: 0,
      total_withdrawal_amount: 0,
      member_balance: 0,
      user: user,
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
              // console.log(where);
              data = await Models[script.module].findAll({
                subQuery: false,
                order: [[Sequelize.literal(orderBy), order]],
                limit: perPage,
                offset: (pageNo - 1) * perPage,
                ...where,
              });
              if (script.module == 'Shoutbox') {
                data = data.reverse();
              }
              // console.log('data', JSON.parse(JSON.stringify(data)));

              var data_count = await Models[script.module].findAndCountAll({
                ...where,
              });
              page_count = Math.ceil(data_count.count / perPage);

              if (script.module == 'MemberReferral') {
                let total = await Models[script.module].findOne({
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
                script_html = await this.appendPagination(
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

            data.forEach(function (payment, key) {
              var date1 = new Date().getTime();
              var hours = payment.withdraw_redo_interval;
              if (payment.WithdrawalRequests.length > 0) {
                // var date2 = new Date(
                //   payment.WithdrawalRequests[0].MemberTransaction.completed_at
                // );
                var date2 = new Date(
                  payment.WithdrawalRequests[0].created_at
                ).getTime();
                var hours = (Math.abs(date2 - date1) / 36e5).toFixed(2);
              }
              data[key].setDataValue('redo_diff', parseFloat(hours));
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
            // console.log(
            //   '===================',
            //   JSON.parse(JSON.stringify(data))
            // );
            // console.log(
            //   '===================',
            //   JSON.parse(JSON.stringify(other_details))
            // );
            break;
          case 'survey':
            const survey = 'survey' in params ? params.survey : '1';
            let temp_survey_list = await this.getSurveys(
              user,
              survey,
              script.module,
              params
            );

            if (temp_survey_list.status) {
              data = temp_survey_list.result.surveys;
              page_count = temp_survey_list.result.page_count;
            } else {
              data = [];
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

    return {
      data: JSON.parse(JSON.stringify(data)),
      script_html,
      page_count,
      other_details: JSON.parse(JSON.stringify(other_details)),
    };
  }
  //get survey
  async getSurveysBkp(user, survey_provider_id, script_module, params) {
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
        message: 'Survey Provider not found!',
        surveys: [],
      };
    }
    /**
     * check and get member's eligibility
     */

    const perPage = 'perpage' in params ? parseInt(params.perpage) : 12;
    const orderBy = 'orderby' in params ? params.orderby : 'id';
    const order = 'order' in params ? params.order : 'desc';
    const pageNo = 'pageno' in params ? parseInt(params.pageno) : 1;
    const param_where = 'where' in params ? JSON.parse(params.where) : null;

    let where = this.getModuleWhere(script_module, user);
    where.where['survey_provider_id'] = provider.id;
    where.where['status'] = 'live';
    if (param_where)
      where.where = {
        ...where.where,
        ...param_where,
      };
    const eligibilities = await MemberEligibilities.findAll({
      attributes: ['survey_question_id', 'precode_id', 'text'],
      where: {
        member_id: memberId,
      },
      include: [
        {
          model: SurveyQuestion,
          attributes: ['id', 'survey_provider_question_id', 'question_type'],
          where: {
            survey_provider_id: provider.id,
          },
        },
        {
          model: Member,
          attributes: ['username'],
        },
      ],
    });

    if (eligibilities) {
      const matchingQuestionCodes = eligibilities.map(
        (eg) => eg.SurveyQuestion.id
      );
      const matchingAnswerCodes = eligibilities
        .filter((eg) => eg.SurveyQuestion.question_type !== 'open-ended') // Removed open ended question. We will not get the value from survey_answer_precodes
        .map((eg) => eg.precode_id);

      if (matchingAnswerCodes.length && matchingQuestionCodes.length) {
        const queryString = {
          ps_supplier_respondent_id: eligibilities[0].Member.username,
          ps_supplier_sid: Date.now(),
        };
        eligibilities.map((eg) => {
          queryString[eg.SurveyQuestion.survey_provider_question_id] =
            eg.precode_id;
        });
        const generateQueryString = new URLSearchParams(queryString).toString();

        const surveys = await Survey.findAll({
          subQuery: false,
          order: [[Sequelize.literal(orderBy), order]],
          limit: perPage,
          offset: (pageNo - 1) * perPage,
          attributes: [
            'id',
            'survey_provider_id',
            'loi',
            'cpi',
            'name',
            'survey_number',
            'url',
          ],
          // where: {
          //     survey_provider_id: provider.id,
          //     status: "live",
          // },
          include: {
            model: SurveyQualification,
            attributes: ['id', 'survey_id', 'survey_question_id'],
            required: true,
            include: {
              model: SurveyAnswerPrecodes,
              attributes: ['id', 'option', 'precode'],
              where: {
                option: matchingAnswerCodes, // [111, 30]
              },
              required: true,
              include: [
                {
                  model: SurveyQuestion,
                  attributes: ['id', 'survey_provider_question_id'],
                  where: {
                    id: matchingQuestionCodes, // ['Age', 'Gender', 'Zipcode']
                    // name: matchingQuestionCodes // ['Age', 'Gender', 'Zipcode']
                  },
                },
              ],
            },
          },
          ...where,
        });
        var data_count = await Survey.findAndCountAll({
          subQuery: false,
          distinct: 'id',
          include: {
            model: SurveyQualification,
            required: true,
            include: {
              model: SurveyAnswerPrecodes,
              where: {
                option: matchingAnswerCodes, // [111, 30]
              },
              required: true,
              include: [
                {
                  model: SurveyQuestion,
                  where: {
                    id: matchingQuestionCodes, // ['Age', 'Gender', 'Zipcode']
                    // name: matchingQuestionCodes // ['Age', 'Gender', 'Zipcode']
                  },
                },
              ],
            },
          },
          ...where,
        });
        let page_count = Math.ceil(data_count.count / perPage);

        if (surveys && surveys.length) {
          var surveyHtml = '';
          surveys.forEach(function (survey, key) {
            let link = `/pure-spectrum/entrylink?survey_number=${
              survey.survey_number
            }${generateQueryString ? '&' + generateQueryString : ''}`;
            surveys[key].setDataValue('link', link);
          });
          return {
            status: true,
            surveys: surveys,
            page_count: page_count,
          };
        } else {
          return {
            status: false,
            message: 'Surveys not found!',
            surveys: [],
          };
        }
      } else {
        return {
          status: false,
          message: 'No surveys have been matched!',
          surveys: [],
        };
      }
    } else {
      return {
        status: false,
        message: 'Member eiligibility not found!',
        surveys: [],
      };
    }
  }
  //get all matched surveys
  //get survey
  async getSurveys(user, survey_provider_id, script_module, params) {
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
    let response = await ProviderController.surveys(memberId, params);
    return response;
  }
  getModuleWhere(module, user) {
    switch (module) {
      case 'Ticket':
        return { where: { member_id: user.id } };

      case 'MemberTransaction':
        return {
          where: user
            ? { member_id: user.id, type: 'credited' }
            : { type: 'credited' },
          include: [
            { model: Models.Member },
            {
              model: Models.WithdrawalRequest,
              include: {
                model: Models.PaymentMethod,
              },
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
            [Sequelize.literal('Member.avatar'), 'avatar'],
            [Sequelize.literal('Member.username'), 'username'],
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
          include: {
            model: Models.Member,
            // as: 'member_referrer',
            include: {
              model: Models.MemberActivityLog,
              attributes: ['created_at'],
              limit: 1,
              order: [['created_at', 'DESC']],
            },
          },
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
            [Models.WithdrawalRequest, Models.MemberTransaction, 'id', 'DESC'],
            [Models.PaymentMethodFieldOption, 'id', 'ASC'],
          ],
          include: [
            {
              model: Models.PaymentMethodFieldOption,
              attributes: ['field_name', 'field_type'],
              required: false,
            },
            // {
            //   model: Models.Country,
            //   as: 'allowed_countries',
            //   where: { id: user.country_id },
            //   required: false,
            //   attributes: ['id'],
            // },
            {
              model: Models.MemberPaymentInformation,
              attributes: ['name', 'value'],
              required: false,
              where: { status: 1, member_id: user.id },
            },
            {
              model: Models.WithdrawalRequest,
              attributes: ['member_transaction_id', 'created_at'],
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
      default:
        return { where: {} };
    }
  }
  //append pagination
  async appendPagination(script_html, script_id, page_no, total_page_count) {
    script_html =
      script_html +
      `<div class="pagination-sec d-flex justify-content-center justify-content-md-end pb-2 pt-0 pb-xl-4 pt-xl-2 px-3 px-lg-4 rounded-bottom">\
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
          if("where" in dataAttrs){ dataAttrs.where =  isJson(dataAttrs.where)}\
          var params = {pageno: 1,perpage: 10,orderby: null,order: null,script: "",member: null,...dataAttrs};\
          $.ajax({\
            url: '/get-scripts/',\
            type: "GET",\
            data: params,\
            success: function (res) {\
              if (res.status) {\
                $(element).html(res.html);\
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
