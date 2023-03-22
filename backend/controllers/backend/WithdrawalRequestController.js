const Controller = require('./Controller');
const Paypal = require('../../helpers/Paypal');

const { Member, User } = require('../../models/index');
class WithdrawalRequestController extends Controller {
  constructor() {
    super('WithdrawalRequest');
  }

  //list
  async list(req, res) {
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

  //save
  async save(req, res) {
    console.log('paypal order-create');
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
    const paypal_class = new Paypal();
    var response = {};
    var response_message = '';
    switch (action_type) {
      case 'capture':
        console.log('paypal order-capture');
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
      case 'reject':
        response = await paypal_class.successPayment(req, res);
        response_message = 'Withdrawal request rejected';
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
}

module.exports = WithdrawalRequestController;
