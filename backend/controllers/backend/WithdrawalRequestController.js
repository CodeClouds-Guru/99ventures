const Controller = require('./Controller');
const Paypal = require('../../helpers/Paypal');
const { Op } = require('sequelize');
const {
  Member,
  User,
  WithdrawalType,
  MemberTransaction,
  WithdrawalRequest,
} = require('../../models/index');
const VirtualIncentive = require('../../helpers/VirtualIncentive');

class WithdrawalRequestController extends Controller {
  constructor() {
    super('WithdrawalRequest');
    this.changeStatus = this.changeStatus.bind(this);
  }

  //list
  async list(req, res) {
    var withdrawal_type = req.query.type;

    if (withdrawal_type === 'withdrawal-types') {
      let withdrawal_type_list = await WithdrawalType.findAll({
        attributes: ['id', 'name', 'slug'],
      });
      let company_portal_id = req.headers.site_id;
      for (let type_list = 0; type_list < withdrawal_type_list.length; type_list++) {
        var pending_withdrawal_count = await this.model.getPendingRequest(
          withdrawal_type_list[type_list].id,
          company_portal_id,
          Member
        );
        withdrawal_type_list[type_list].setDataValue('pending_withdrawal_count', pending_withdrawal_count);
      }
      return {
        result: {
          data: withdrawal_type_list,
        },
      };
    } else if (withdrawal_type === 'withdrawal-count') {
      let withdrawal_type_list = await WithdrawalType.findAll({
        attributes: ['id', 'name', 'slug'],
      });
      var all_counts = {}
      var pending_withdrawal_count = 0;
      let company_portal_id = req.headers.site_id;
      for (var type_list of withdrawal_type_list) {
        var pending_withdrawal_count = await this.model.getPendingRequest(type_list.id, company_portal_id, Member);
        all_counts[type_list.slug] = pending_withdrawal_count
      }
      return {
        result: {
          data: all_counts,
        }
      };
    } else {
      let page = req.query.page || 1;
      let limit = parseInt(req.query.show) || 10; // per page record
      let offset = (page - 1) * limit;
      var options = super.getQueryOptions(req);
      var option_where = options.where || {};
      let company_portal_id = req.headers.site_id;
      var query_where = req.query.where || '{}';
      query_where = JSON.parse(query_where);
      var new_option = {};
      var and_query = {};
      var fields = this.model.fields;
      if ('withdrawal_type_id' in query_where) {
        fields['$Member.username$'].listing = true;
        fields['$Member.username$'].searchable = true;
      } else {
        fields['$Member.username$'].listing = false;
        fields['$Member.username$'].searchable = false;
      }

      if ('created_at' in query_where) {
        var and_query = {
          created_at: {
            [Op.between]: query_where.created_at,
          },
        };
        if (Object.keys(query_where).length > 0) {
          if (Op.and in option_where) {
            new_option[Op.and] = {
              ...option_where[Op.and],
              ...and_query,
            };
          } else {
            new_option[Op.and] = {
              ...option_where,
              ...and_query,
            };
          }
        }
        options.where = new_option;
      }
      options.include = [
        {
          model: Member,
          attributes: ['first_name', 'last_name', 'username','admin_status'],
          where: { company_portal_id: company_portal_id },
        },
        {
          model: MemberTransaction,
          attributes: ['transaction_id']
        },
        {
          model: User,
          attributes: ['alias_name'],
        },
      ];
      options.limit = limit;
      options.offset = offset;
      options.subQuery = false;
      let results = await this.model.findAndCountAll(options);
      let pending_req_where = {}
      let pages = Math.ceil(results.count / limit);
      results.rows.forEach(function (record, key) {
        if (record.dataValues.Member != null) {
          record.dataValues['Member.first_name'] =
            record.dataValues.Member.dataValues.first_name +
            ' ' +
            record.dataValues.Member.dataValues.last_name;
          record.dataValues['Member.username'] =
            record.dataValues.Member.dataValues.username;
          record.dataValues['Member.admin_status'] =
            record.dataValues.Member.dataValues.admin_status;
        }
        if (record.dataValues.User != null) {
          record.dataValues['User.alias_name'] =
            record.dataValues.User.dataValues.alias_name;
        }
        if (record.dataValues.MemberTransaction != null && record.dataValues.MemberTransaction.dataValues.transaction_id) {
          record.dataValues['MemberTransaction.transaction_id'] = record.dataValues.MemberTransaction.dataValues.transaction_id
        } else {
          record.dataValues['MemberTransaction.transaction_id'] = 'NA'
        }
      });

      var programsList = [];
      if ('withdrawal_type_id' in query_where) {
        const withdrawlType = await WithdrawalType.findOne({
          attributes: ['slug'],
          where: { id: query_where.withdrawal_type_id },
        });
        if (withdrawlType.slug === 'gift_card_pass') {
          const viObj = new VirtualIncentive(company_portal_id);
          const programs = await viObj.getProgramBalance();
          if (Object.keys(programs).length && programs.program) {
            programsList = programs.program
              .filter(
                (row) => row.name !== 'DO NOT USE' && row.type === 'Gift Cards'
              )
              .map((row) => {
                return {
                  ...row,
                  id: row.programid,
                };
              });
          }
        } else if (withdrawlType.slug === 'venmo') {
          const viObj = new VirtualIncentive(company_portal_id);
          const programs = await viObj.getProgramBalance();
          if (Object.keys(programs).length && programs.program) {
            programsList = programs.program
              .filter(
                (row) =>
                  row.name !== 'DO NOT USE' && row.type === 'Virtual Reward'
              )
              .map((row) => {
                return {
                  ...row,
                  id: row.programid,
                };
              });
          }
        }
      }

      return {
        result: { data: results.rows, pages, total: results.count },
        fields: this.model.fields,
        programs: programsList,
      };
    }
  }

  //save
  async save(req, res) {
    const paypal_class = new Paypal();
    const create_resp = await paypal_class.createOrder(req);

    if (create_resp.status) {
      return {
        status: true,
        message: 'Pyament initiated',
        data: create_resp.report,
      };
    } else {
      this.throwCustomError(create_resp.error, 500);
    }
  }

  //update
  async update(req, res) {
    const action_type = req.body.action_type || 'capture';
    let model_ids = req.body.model_ids || [];
    let note = req.body.note || '';
    const paypal_class = new Paypal();
    var response = {};
    var response_message = '';
    switch (action_type) {
      case 'capture':
        response = await paypal_class.capturePayment(req, res);
        if (response.status) {
          response = response.report;
          response_message = 'Payment processed';
        } else {
          this.throwCustomError(create_resp.error, 500);
        }

        break;
      case 'success':
        response = await paypal_class.successPayment(req, res);
        response_message = 'Transaction successful';
        break;
      case 'rejected':
        // response = await paypal_class.successPayment(req, res);
        response = await this.changeStatus(model_ids, note, action_type);
        response_message = 'Withdrawal request rejected';
        break;
      case 'approved':
        // response = await paypal_class.successPayment(req, res);
        response = await this.changeStatus(model_ids, note, action_type);
        response_message = 'Withdrawal request approved';
        let all_withdrawal_req = await this.model.findAll({
          where: {
            id: {
              [Op.in]: model_ids,
            },
          },
          attributes: [
            'id',
            'member_id',
            'amount',
            'currency',
            'payment_email',
            'member_transaction_id',
            'withdrawal_type_id',
          ],
          include: [
            {
              model: Member,
              attributes: ['first_name', 'last_name', 'username'],
            },
            {
              model: WithdrawalType,
              attributes: ['slug', 'payment_method_id'],
            },
          ],
        });
        var items = [];
        var transaction_ids = [];
        let transaction_id = '';
        for (let record of all_withdrawal_req) {
          // console.log('-------------record', record);
          //insert in transaction table
          if (record.member_transaction_id) {
            transaction_ids.push(record.member_transaction_id);
            transaction_id = record.member_transaction_id;
          } else {
            let transaction_status = 1;
            if (record.WithdrawalType.slug === 'skrill') {
              transaction_status = 2;
            }

            let transaction =
              await MemberTransaction.updateMemberTransactionAndBalance({
                member_id: record.member_id,
                amount: -record.amount,
                note: '',
                status: transaction_status,
                type: 'withdraw',
                amount_action: 'member_withdrawal',
                currency: record.currency,
                created_by: req.user.id,
              });
            // let transaction = await MemberTransaction.create({
            //   type:'withdraw',
            //   amount: record.amount,
            //   status: '1',
            //   member_id: record.member_id,
            //   amount_action: 'member_withdrawal',
            //   currency: record.currency,
            //   completed_at: new Date()
            // })
            transaction_ids.push(transaction.transaction_id);
            transaction_id = transaction.transaction_id;
            await WithdrawalRequest.update(
              { member_transaction_id: transaction_id },
              { where: { id: record.id } }
            );
          }
          if (
            record.WithdrawalType.slug === 'paypal' ||
            record.WithdrawalType.slug === 'instant_paypal'
          ) {
            //paypal payload
            var record_currency = ''
            if (record.currency === '$') {
              record_currency = 'USD'
            } else if (record.currency) {
              record_currency = record.currency.toUpperCase()
            }
            items.push({
              amount: record.amount,
              currency: record_currency,
              member_id: record.member_id,
              email: record.payment_email,
              first_name: record.dataValues.Member.dataValues.first_name,
              last_name: record.dataValues.Member.dataValues.last_name,
              member_transaction_id: transaction_id,
            });
          }
        }

        if (items.length > 0) {
          let company_portal_id = req.headers.site_id;
          //do bulk payment
          const paypal_class = new Paypal(company_portal_id);
          const create_resp = await paypal_class.payout(items);
          if (create_resp.status) {
            await MemberTransaction.update(
              { batch_id: create_resp.batch_id },
              {
                where: {
                  id: {
                    [Op.in]: transaction_ids,
                  },
                },
              }
            );
          }
        }

        break;
      default:
        response_message = 'Payment processed';
    }
    var pending_withdrawal_count = await WithdrawalRequest.getPendingRequest(
      '',
      req.headers.site_id,
      Member
    );
    return {
      status: true,
      message: response_message,
      pending_withrawal_request: pending_withdrawal_count,
      response,
    };
  }
  async changeStatus(model_ids, note, action_type) {
    let response = [];
    if (model_ids.length) {
      let update_data = {
        note: note,
        status: action_type,
      };
      response = await this.model.update(update_data, {
        where: {
          id: {
            [Op.in]: model_ids,
          },
        },
        return: true,
      });
    }
    return response;
  }
}

module.exports = WithdrawalRequestController;
