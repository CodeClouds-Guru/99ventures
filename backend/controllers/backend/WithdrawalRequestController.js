const Controller = require('./Controller');
const Paypal = require('../../helpers/Paypal');
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../../models/index');
const {
  Member,
  User,
  PaymentMethod,
  MemberTransaction,
  WithdrawalRequest,
  MemberBalance,
  MembershipTier,
} = require('../../models/index');
const VirtualIncentive = require('../../helpers/VirtualIncentive');
const CsvHelper = require('../../helpers/CsvHelper');
const db = require('../../models/index');
const eventBus = require('../../eventBus');

class WithdrawalRequestController extends Controller {
  constructor() {
    super('WithdrawalRequest');
    this.changeStatus = this.changeStatus.bind(this);
    this.getPaymentMethods = this.getPaymentMethods.bind(this);
    this.generateFields = this.generateFields.bind(this);
    this.getProgramList = this.getProgramList.bind(this);
    this.fieldConfig = {
      id: 'ID',
      'PaymentMethod.name': 'Method',
      status: 'Status',
      payment_email: 'Email',
      'Member.status': 'Account',
      'Member.admin_status': 'Admin Status',
      created_at: 'Date',
      'Member.username': 'Username',
      amount_with_currency: 'Cash',
    };
  }

  async getPaymentMethods() {
    let withdrawal_type_list = await sequelize.query(
      "SELECT id, name, slug, (SELECT COUNT(*) from withdrawal_requests where withdrawal_requests.withdrawal_type_id = payment_methods.id and withdrawal_requests.status = 'pending') as pending_withdrawal_count FROM `payment_methods`;",
      { type: QueryTypes.SELECT }
    );
    return {
      result: {
        data: withdrawal_type_list,
      },
    };
  }

  generateFields(header_fields) {
    var fields = {};
    for (const key of header_fields) {
      let k =
        key === '`Member.status` AS `Member.member_status`'
          ? 'Member.status'
          : key;
      fields[k] = {
        field_name: k,
        db_name: k,
        listing: true,
        placeholder:
          key in this.fieldConfig
            ? this.fieldConfig[key]
            : key === '`Member.status` AS `Member.member_status`'
            ? 'Account'
            : 'Unknown Col',
      };
    }
    return fields;
  }

  //list
  async list(req, res) {
    var withdrawal_type = req.query.type;
    if (withdrawal_type === 'withdrawal-types') {
      return await this.getPaymentMethods();
    } else {
      let limit = parseInt(req.query.show) || 10;

      let fields = req.query.fields || ['id', 'first_name', 'username'];
      let fields_temp = req.query.fields || ['id', 'first_name', 'username'];
      const index = fields_temp.indexOf('Member.status');

      if (index > 0)
        fields_temp[index] = '`Member.status` AS `Member.member_status`';
      const options = this.getQueryOptions(req);
      options.include = [
        {
          model: PaymentMethod,
          attributes: ['name'],
          paranoid: false,
        },
        {
          model: Member,
          paranoid: false,
          attributes: ['id', 'username', 'status', 'admin_status'],
          include: { model: MembershipTier, attributes: ['name'] },
        },
      ];
      options.subQuery = false;
      options.distinct = true;
      options.attributes = [
        'id',
        'amount',
        'currency',
        'member_id',
        ...fields_temp,
      ];

      let programsList = await this.getProgramList(req);
      let results = await this.model.findAndCountAll(options);
      let pages = Math.ceil(results.count / limit);
      let member_ids = results.rows.map((item) => item.member_id);
      let query =
        'SELECT distinct member_id, created_at from member_transactions where member_id in ? and amount_action = "reversed_transaction" and status = 5 order by created_at desc limit 0,1';
      let reversal_transactions =
        member_ids.length > 0
          ? await db.sequelize.query(query, {
              replacements: [[member_ids]],
              type: QueryTypes.SELECT,
            })
          : null;
      // console.log(reversal_transactions);
      results.rows.map((row, key) => {
        let [payment_method_name, username, status, admin_status] = [
          '',
          '',
          '',
          '',
        ];
        if (row.Member) {
          let tier_name = row.Member.MembershipTier
            ? `(${row.Member.MembershipTier.name})`
            : '';
          username = `${row.Member.username} ${tier_name}`;
          status = row.Member.status;
          admin_status = row.Member.admin_status;
        }
        if (row.PaymentMethod) {
          payment_method_name = row.PaymentMethod.name;
        }

        row.setDataValue('Member.username', username);
        row.setDataValue('Member.status', status);
        row.setDataValue('Member.admin_status', admin_status);
        row.setDataValue('PaymentMethod.name', payment_method_name);

        //check if any reversal happened after withdraw req
        // let query =
        //   'SELECT COUNT(id) as reverse_count from member_transactions where member_id =? and amount_action = "reversed_transaction" and status = 5 and created_at > (select created_at from withdrawal_requests where member_id = ? and status = "pending" order by created_at limit 0,1)';
        // let reversal_transaction = await db.sequelize.query(query, {
        //   replacements: [row.member_id, row.member_id],
        //   type: QueryTypes.SELECT,
        // });

        row.setDataValue('reverse_count', '');
        let obj = reversal_transactions
          ? reversal_transactions.find(
              (o) =>
                o.member_id === row.member_id && o.created_at > row.created_at
            )
          : null;
        // console.log('obj', obj);
        let warning_text =
          obj && row.status == 'pending'
            ? 'This user received a reversed transaction. Please be carefull before approving the request!'
            : null;
        // console.log('reversal_transaction', reversal_transaction);
        row.setDataValue('reverse_count', warning_text);
        results.rows[key]['reverse_count'] = warning_text;
        row.reverse_count = warning_text;
      });

      /**
      let page = req.query.page || 1;
      let limit = parseInt(req.query.show) || 10;
      let offset = (page - 1) * limit;
      var options = super.getQueryOptions(req);
      var option_where = options.where || {};
      let company_portal_id = req.headers.site_id;
      var query_where = req.query.where || '{}';
      query_where = JSON.parse(query_where);
      var new_option = {};
      var and_query = {};
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
          attributes: ['first_name', 'last_name', 'username', 'admin_status'],
          where: { company_portal_id: company_portal_id },
        },
        {
          model: MemberTransaction,
          attributes: ['transaction_id'],
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
      let pending_req_where = {};
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
        if (
          record.dataValues.MemberTransaction != null &&
          record.dataValues.MemberTransaction.dataValues.transaction_id
        ) {
          record.dataValues['MemberTransaction.transaction_id'] =
            record.dataValues.MemberTransaction.dataValues.transaction_id;
        } else {
          record.dataValues['MemberTransaction.transaction_id'] = 'NA';
        }
      });

      var fields = {
        '$Member.username$': {
          field_name: 'Member.username',
          db_name: '`Member`.`username`',
          type: 'text',
          placeholder: 'Username',
          listing: false,
          show_in_form: false,
          sort: true,
          required: false,
          value: '',
          width: '50',
          searchable: true,
        },
        requested_on: {
          field_name: 'requested_on',
          db_name: 'requested_on',
          type: 'text',
          placeholder: 'Requested on',
          listing: true,
          show_in_form: false,
          sort: true,
          required: true,
          value: '',
          width: '50',
          searchable: false,
        },
        payment_email: {
          field_name: 'payment_email',
          db_name: 'payment_email',
          type: 'text',
          placeholder: 'Email',
          listing: true,
          show_in_form: true,
          sort: true,
          required: true,
          value: '',
          width: '50',
          searchable: true,
        },
        currency: {
          field_name: 'currency',
          db_name: 'currency',
          type: 'text',
          placeholder: 'Currency',
          listing: true,
          show_in_form: false,
          sort: true,
          required: true,
          value: '',
          width: '50',
          searchable: false,
        },
        amount: {
          field_name: 'amount',
          db_name: 'amount',
          type: 'text',
          placeholder: 'Amount',
          listing: true,
          show_in_form: true,
          sort: true,
          required: true,
          value: '',
          width: '50',
          searchable: true,
        },
        '$Member.admin_status$': {
          field_name: 'Member.admin_status',
          db_name: '`Member`.`admin_status`',
          type: 'text',
          placeholder: 'Admin Status',
          listing: true,
          show_in_form: false,
          sort: true,
          required: false,
          value: '',
          width: '50',
          searchable: true,
        },
        ip: {
          field_name: 'ip',
          db_name: 'ip',
          type: 'text',
          placeholder: 'IP',
          listing: true,
          show_in_form: false,
          sort: true,
          required: true,
          value: '',
          width: '50',
          searchable: true,
        }
      }
      if ('withdrawal_type_id' in query_where) {
        fields['$Member.username$'].listing = true;
        fields['$Member.username$'].searchable = true;
      } else {
        fields['$Member.username$'].listing = false;
        fields['$Member.username$'].searchable = false;
      }
      */
      // console.log(fields);
      return {
        result: { data: results.rows, pages, total: results.count },
        fields: this.generateFields(fields),
        programs: programsList,
      };
    }
  }

  async getProgramList(req) {
    let company_portal_id = req.headers.site_id;
    var query_where = req.query.where || '{}';
    query_where = JSON.parse(query_where);
    var programsList = [];
    if ('withdrawal_type_id' in query_where) {
      const withdrawlType = await PaymentMethod.findOne({
        attributes: ['slug'],
        where: { id: query_where.withdrawal_type_id },
        paranoid: false,
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
    return programsList;
  }

  async export(req, res) {
    req.query.show = 100000;
    let { fields, result } = await this.list(req);
    var header = [];
    for (const head of Object.values(fields)) {
      header.push({ id: head.field_name, title: head.placeholder });
    }
    const rows = JSON.parse(JSON.stringify(result.data));
    const csv_helper = new CsvHelper(rows, header);
    csv_helper.generateAndEmailCSV(req.user.email);
    return {
      status: true,
      message: 'The CSV will be sent to your email address shortly.',
    };
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
        // response = await this.changeStatus(model_ids, note, action_type);
        response_message = 'Withdrawal request rejected';
        await this.model.rejectedOrFailedRequest(
          model_ids,
          req.user.id,
          'rejected'
        );
        break;
      case 'approved':
        // console.log(model_ids);

        response_message = 'Withdrawal request approved';
        let all_withdrawal_req = await this.model.findAll({
          where: {
            id: {
              [Op.in]: model_ids,
            },
            status: 'pending',
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
              attributes: [
                'first_name',
                'last_name',
                'username',
                'primary_payment_method_id',
              ],
            },
            {
              model: PaymentMethod,
              attributes: [
                'slug',
                'id',
                'payment_type',
                'api_username',
                'api_password',
              ],
            },
          ],
          // logging: console.log,
        });
        // console.log(all_withdrawal_req);
        var items = [];
        var transaction_ids = [];
        var transaction_ids_without_creds = [];
        var withdrawal_ids_without_creds = [];
        var member_ids = [];
        let transaction_id = '';
        // var transaction_status = 1;
        response = await this.changeStatus(model_ids, note, action_type);
        for (let record of all_withdrawal_req) {
          // console.log('-------------record', record);
          if (
            record.PaymentMethod.api_username === '' &&
            record.PaymentMethod.api_password === ''
          ) {
            // transaction_status = 2;
            transaction_ids_without_creds.push(record.member_transaction_id);
            withdrawal_ids_without_creds.push(record.id);
            await this.model.approvedAndCompletedReqs(
              record.member_transaction_id,
              record.id
            );
            member_ids.push(record.member_id);
            eventBus.emit('membership_tier_shift', {
              member_id: record.member_id,
            });
          }

          if (
            record.PaymentMethod.slug === 'paypal' ||
            record.PaymentMethod.slug === 'instant_paypal'
          ) {
            //paypal payload
            transaction_ids.push(record.member_transaction_id);
            transaction_id = record.member_transaction_id;
            var record_currency = '';
            if (record.currency === '$') {
              record_currency = 'USD';
            } else if (record.currency) {
              record_currency = record.currency.toUpperCase();
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
          // console.log('------------create_resp', create_resp);
          const logger1 = require('../../helpers/Logger')(
            `paypal-payout-log.log`
          );
          logger1.info(
            JSON.stringify({
              items,
              create_resp,
            })
          );
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

        // member_ids = [...new Set(member_ids)];
        // for (let id of member_ids) {
        //   eventBus.emit('membership_tier_shift', {
        //     member_id: id,
        //   });
        // }

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
    let get_withdrawals = await this.model.findAll({
      where: { id: model_ids, status: 'pending' },
    });
    for (let records of get_withdrawals) {
      await this.model.update(
        { status: action_type, note: note },
        { where: { id: records.id } }
      );
    }
    return true;

    // if (model_ids.length) {
    //   let update_data = {
    //     note: note,
    //     status: action_type,
    //   };
    //   response = await this.model.update(update_data, {
    //     where: {
    //       id: {
    //         [Op.in]: model_ids,
    //         status: 'pending',
    //       },
    //     },
    //     return: true,
    //   });
    // }
  }

  //format
  async withdrawList() {
    let [payment_method_name, username, status, admin_status] = [
      '',
      '',
      '',
      '',
    ];
    if (row.Member) {
      username = row.Member.username;
      status = row.Member.status;
      admin_status = row.Member.admin_status;
    }
    if (row.PaymentMethod) {
      payment_method_name = row.PaymentMethod.name;
    }

    row.setDataValue('Member.username', username);
    row.setDataValue('Member.status', status);
    row.setDataValue('Member.admin_status', admin_status);
    row.setDataValue('PaymentMethod.name', payment_method_name);

    //check if any reversal happened after withdraw req
    let query =
      'SELECT COUNT(id) as reverse_count from member_transactions where member_id =? and amount_action = "reversed_transaction" and status = 5 and created_at > (select created_at from withdrawal_requests where member_id = ? and status = "pending" order by created_at limit 0,1)';
    let reversal_transaction = await db.sequelize.query(query, {
      replacements: [row.member_id, row.member_id],
      type: QueryTypes.SELECT,
    });

    row.setDataValue('reverse_count', '');
    let warning_text =
      reversal_transaction.length > 0 &&
      reversal_transaction[0].reverse_count > 0
        ? 'This user received a reversed transaction. Please be carefull before approving the request!'
        : '';
    // console.log('reversal_transaction', reversal_transaction);
    row.setDataValue('reverse_count', warning_text);
    results.rows[key]['reverse_count'] = warning_text;
    row.reverse_count = warning_text;
  }
}

module.exports = WithdrawalRequestController;
