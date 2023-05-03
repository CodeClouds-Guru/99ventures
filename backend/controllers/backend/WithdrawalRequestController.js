const Controller = require('./Controller');
const Paypal = require('../../helpers/Paypal');
const { Op } = require('sequelize');
const { Member, User,WithdrawalType } = require('../../models/index');
class WithdrawalRequestController extends Controller {
  constructor() {
    super('WithdrawalRequest');
    this.changeStatus = this.changeStatus.bind(this);
  }

  //list
  async list(req, res) {
    var withdrawal_type = req.query.type
   
    if(withdrawal_type === 'withdrawal-types'){
      let withdrawal_type_list = await WithdrawalType.findAll({attributes:['id','name','slug']})
      return {
        result:{
          data: withdrawal_type_list
        }
      }
    }
    else{
      let page = req.query.page || 1;
      let limit = parseInt(req.query.show) || 10; // per page record
      let offset = (page - 1) * limit;
      var options = super.getQueryOptions(req);
      var option_where = options.where || {};
      let company_portal_id = req.headers.site_id;
      var query_where = req.query.where || '{}';
      query_where = JSON.parse(query_where);
      var new_option = {};
      var and_query = {}
      var  fields = this.model.fields
      if('withdrawal_type_id' in query_where){
        fields['$Member.username$'].listing = true
        fields['$Member.username$'].searchable = true
      }else{
        fields['$Member.username$'].listing = false
        fields['$Member.username$'].searchable = true
      }
      if('created_at' in query_where){
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
          attributes: ['first_name', 'last_name','username'],
          where: {company_portal_id:company_portal_id}
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
      let pages = Math.ceil(results.count / limit);
      results.rows.forEach(function (record, key) {
        if (record.dataValues.Member != null) {
          record.dataValues['Member.first_name'] =
            record.dataValues.Member.dataValues.first_name +
            ' ' +
            record.dataValues.Member.dataValues.last_name;
        }
        if (record.dataValues.User != null) {
          record.dataValues['User.alias_name'] =
            record.dataValues.User.dataValues.alias_name;
        }
      });
      return {
        result: { data: results.rows, pages, total:results.count },
        fields: this.model.fields,
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
        break;
      default:
        response_message = 'Payment processed';
    }

    return {
      status: true,
      message: response_message,
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