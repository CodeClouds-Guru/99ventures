const Controller = require('./Controller');
const Paypal = require('../../helpers/Paypal');
class WithdrawalRequestController extends Controller {
  constructor() {
    super('WithdrawalRequest');
  }
  //save
  async save(req, res) {
    console.log('paypal order-create');
    let paypal_class = new Paypal();
    let create_order = await paypal_class.createOrder(req);
    return {
      status: true,
      message: 'Pyament initiated',
      create_order,
    };
  }

  //update
  async update(req, res) {
    const action_type = req.body.action_type || 'capture';
    let paypal_class = new Paypal();
    var response = {};
    if (action_type === 'capture') {
      console.log('paypal order-capture');
      response = await paypal_class.capturePayment(req, res);
    } else {
      response = await paypal_class.successPayment(req, res);
    }
    return {
      status: true,
      message:
        action_type === 'capture'
          ? 'Payment processed'
          : 'Transaction successful',
      response,
    };
  }
}

module.exports = WithdrawalRequestController;
