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
      var options = super.getQueryOptions(req);
      options.include = [
        {
          model: Member,
          attributes: ['first_name', 'last_name'],
        },
        {
          model: User,
          attributes: ['alias_name'],
        },
      ];
      const { docs, pages, total } = await this.model.paginate(options);
      docs.forEach(function (record, key) {
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
        result: { data: docs, pages, total },
        fields: this.model.fields,
      };
    }
  }

  //save
  async save(req, res) {
    // console.log('paypal order-create');
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
        // console.log('paypal order-capture');
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
