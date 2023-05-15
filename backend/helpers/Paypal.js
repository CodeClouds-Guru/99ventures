const axios = require('axios');
const { Console } = require('winston/lib/winston/transports');
const {
  MemberTransaction,
  PaymentMethodCredential,
  WithdrawalRequest,
  Member,
  MemberBalance,
  MemberNotification
} = require('../models');
const paypal = require('@paypal/payouts-sdk');
const db = require("../models/index");
const { QueryTypes, Op } = require("sequelize");
const eventBus = require('../eventBus');
class Paypal {
  constructor(company_portal_id='') {
    this.company_portal_id = company_portal_id
    this.clientId =
      'AS34VNOhe5wGedg3E8MkZsWWIb7VoHE54CoLYrGbib8FeNFmAlrMUwgsIDPbYNIC48YPXN6Vl-9FMR7H';
    this.clientSecret =
      'EPa00U3-OJlqXifqGPFmVDSz5LXQmSO4KDoVGmqaLwgRpeMc5KkgdxTRj6Kw6yq3aCf_Tp8xg6MYiOuF';
    this.auth = Buffer.from(this.clientId + ':' + this.clientSecret).toString(
      'base64'
    );
    // this.baseURL = {
    //   sandbox: 'https://api-m.sandbox.paypal.com',
    //   production: 'https://api-m.paypal.com',
    // };
    // this.instance = axios.create({
    //   baseURL: this.baseURL.sandbox,
    //   timeout: 10000,
    // });
    // this.postAndReturnData = this.postAndReturnData.bind(this);
    // this.paypalConfig = this.paypalConfig.bind(this);
    // this.generateAccessToken = this.generateAccessToken.bind(this);
    // this.createOrder = this.createOrder.bind(this);
    this.payout = this.payout.bind(this);
    this.getPaypalClient = this.getPaypalClient.bind(this);
    this.createPayouts = this.createPayouts.bind(this);
  }

  /**
   * Function to return paypal client
   * @returns {paypal.core.PayPalHttpClient}
   */
  async getPaypalClient() {
    let paypal_credentials = await PaymentMethodCredential.findAll({
      attributes: ['slug', 'value'],
      where: {
        payment_method_id: 1,
        company_portal_id: this.company_portal_id,
      },
    });
    let clientId = ''
    let clientSecret = ''
    for(let record of paypal_credentials){
      if(record.slug == 'client_id'){
        clientId = record.value
      }
      else if(record.slug == 'secret'){
        clientSecret = record.value
      }
    }
    // let clientId = this.clientId;
    // let clientSecret = this.clientSecret;
    let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    return new paypal.core.PayPalHttpClient(environment);
  }


  /**
   * Function to create Request Body
   * @param {Array} items 
   * @returns {Object}
   */
  createRequestBody(items) {
    return {
      "sender_batch_header": {
        "recipient_type": "EMAIL",
        "email_message": "Payments",
        "note": "Payment from Moresurveys",
        "sender_batch_id": `MS-Batch-TXN-${Date.now()}`,
        "email_subject": "Congratulations! Payment credited to your paypal account"
      },
      "items": items
    }
  }

  /**
   * Function to perform payout
   * @returns {Boolean}
   * @param {Array} payload
   * [{ email: 'sb-vwa0c25891350@business.example.com', member_transaction_id: 0, currency: 'USD',amount: 1.00}]
   */
  async payout(payload) {
    try{
    let items = payload.map(item => {
      return {
        "note": `Payment for withdrawal request #${item.member_transaction_id}`,
        "amount": {
          "currency": item.currency || 'USD',
          "value": item.amount,
        },
        "receiver": item.email,
        "sender_item_id": `${item.member_transaction_id}`,
      }
    });
    const requestBody = this.createRequestBody(items);
    let request = new paypal.payouts.PayoutsPostRequest();
    request.requestBody(requestBody);
    const resp = await this.createPayouts(request);
    let batch_id =''
    if(parseInt(resp.statusCode) == 201){
      batch_id = resp.result.batch_header.payout_batch_id
      return {
        status:true,
        message:'Payment request initiated.',
        batch_id:batch_id,
        res:resp
      }
    }else{
      return {
        status: false,
        message: 'Failed to initiate the payment.'
      }
    }
  }catch(e){
    console.log(e)
    return{
      status: false,
      message:e
    }
  }
  }

  /**
   * Function to make the transaction
   * @param {Object} request 
   * @returns {Object}
   */
  async createPayouts(request) {
    const client = await this.getPaypalClient();
    try {
      let response = await client.execute(request);
      return response;
    }
    catch (e) {
      var err = {}
      if (e.statusCode) {
        const error = JSON.parse(e.message)
        err = {
          "status_code": e.statusCode,
          "failure_response": error,
          "headers": e.headers
        }
        console.log(err)
      } else {
        err.e = e
        console.log(e)
      }
      return { status: false, error: err }
    }
  }
  //get confirmation
  async getPayouts(req) {
    try{
      if(req.event_type){
        let batchId = req.resource.batch_header.payout_batch_id
        const client = await this.getPaypalClient();
        let request = new paypal.payouts.PayoutsGetRequest(batchId);
        request.page(1);
        request.pageSize(10);
        request.totalRequired(true);
        // Call API with your client and get a response for your call
        let response = await client.execute(request);
        //console.log(`Response: ${JSON.stringify(response)}`);
        // If call returns body in response, you can get the deserialized version from the result attribute of the response.
        //console.log(`Payouts Batch: ${JSON.stringify(response.result)}`);
        var status = '4'
        if(req.event_type === 'PAYMENT.PAYOUTSBATCH.SUCCESS'){
          status = '2'
        }
        if(parseInt(response.statusCode) == 200){
          
          let items = response.result.items
          for(let record of items){
            let member_transaction_id = record.payout_item.sender_item_id
            let transaction_record = await MemberTransaction.findOne({where:{id:member_transaction_id}})
            if(transaction_record){
                let transaction_id = record.transaction_id;
                //member balance
                let total_earnings = await db.sequelize.query(
                "SELECT id, amount as total_amount, amount_type FROM `member_balances` WHERE member_id=? AND amount_type='cash'",
                {
                  replacements: [transaction_record.member_id],
                  type: QueryTypes.SELECT,
                }
              );
              console.log(record.payout_item.amount.value)
              let modified_total_earnings =
                parseFloat(total_earnings[0].total_amount) - parseFloat(record.payout_item.amount.value);

                await MemberTransaction.update({
                  transaction_id: transaction_id,
                  status:status,
                  completed_at: new Date(),
                  payment_gateway_json: req,
                  balance:modified_total_earnings
                },{where:{id:member_transaction_id}})

                await MemberBalance.update(
                  { amount: modified_total_earnings },
                  {
                    where: { id: total_earnings[0].id },
                  }
                );

                //send mail to member
                let member_details = await Member.findOne({where:{id:transaction_record.member_id}})
                let withdraw_requests = await WithdrawalRequest.findOne({where:{member_transaction_id:member_transaction_id}})
                let evntbus = eventBus.emit('send_email', {
                  action: 'Payment Confirmation',
                  data: {
                    email: member_details.email,
                    details: { members: member_details,withdraw_requests:withdraw_requests },
                  },
                  req: req,
                });
                //send notification
                let notify_data = {
                  member_id: transaction_record.member_id,
                  verbose:'Withdrawal request for '+withdraw_requests.amount+' has been completed.',
                  action: 'payment_confirmation',
                  is_read: '0',
                  read_on: new Date(),
                };
                await MemberNotification.create(notify_data);
            }
          }
        }
      }
      return{
        status:true
      }
    }catch(e){
      console.log(e)
      return{
        status:false,
        message: e
      }
    }
}
}

module.exports = Paypal;
