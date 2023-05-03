const axios = require('axios');
const { Console } = require('winston/lib/winston/transports');
const {
  MemberTransaction,
  PaymentMethodCredential,
  WithdrawalRequest,
  Member,
} = require('../models');
// const paypal = require('@paypal/payouts-sdk');
class Paypal {
  constructor() {
    this.clientId =
      'AS34VNOhe5wGedg3E8MkZsWWIb7VoHE54CoLYrGbib8FeNFmAlrMUwgsIDPbYNIC48YPXN6Vl-9FMR7H';
    this.clientSecret =
      'EPa00U3-OJlqXifqGPFmVDSz5LXQmSO4KDoVGmqaLwgRpeMc5KkgdxTRj6Kw6yq3aCf_Tp8xg6MYiOuF';
    this.auth = Buffer.from(this.clientId + ':' + this.clientSecret).toString(
      'base64'
    );
    this.baseURL = {
      sandbox: 'https://api-m.sandbox.paypal.com',
      production: 'https://api-m.paypal.com',
    };
    this.instance = axios.create({
      baseURL: this.baseURL.sandbox,
      timeout: 10000,
    });
    this.postAndReturnData = this.postAndReturnData.bind(this);
    this.paypalConfig = this.paypalConfig.bind(this);
    this.generateAccessToken = this.generateAccessToken.bind(this);
    this.createOrder = this.createOrder.bind(this);
  }

  async postAndReturnData(partUrl) {
    let resp = {
      status: false,
      report: null,
      error: '',
    };
    try {
      const instance = axios.create({
        baseURL: this.baseURL.sandbox,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json, text/plain, */*',
          Authorization: `Basic ${this.auth}`,
        },
      });
      let response = await instance.post(
        partUrl,
        'grant_type=client_credentials'
      );
      const jsonData = await this.handleResponse(response);
      resp.status = true;
      resp.report = jsonData.access_token;
    } catch (e) {
      resp.error = e.message;
    } finally {
      return resp;
    }
  }

  async postWithPayload(partUrl, accessToken, payload = '') {
    let resp = {
      status: false,
      report: null,
      error: '',
    };
    try {
      const instance = axios.create({
        baseURL: this.baseURL.sandbox,
        timeout: 10000,
        // method: post,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      let response = {};
      if (payload !== '') {
        response = await instance.post(partUrl, payload);
      } else {
        response = await instance.post(partUrl);
      }
      const jsonData = await this.handleResponse(response);
      resp.status = true;
      resp.report = jsonData;
    } catch (e) {
      resp.error = e.message;
    } finally {
      return resp;
    }
  }

  async paypalConfig(site_id) {
    const paypal_creds = await PaymentMethodCredential.findAll({
      attributes: ['slug', 'value'],
      where: {
        payment_method_id: 1,
        company_portal_id: site_id,
      },
    });
    console.log('paypal_creds', paypal_creds);
    // this.clientId =
    //   paypal_creds[0].slug === 'client_id'
    //     ? paypal_creds[0].value
    //     : paypal_creds[1].value;
    // this.clientSecret =
    //   paypal_creds[1].slug === 'client_id'
    //     ? paypal_creds[1].value
    //     : paypal_creds[0].value;
  }

  // generate an access token using client id and app secret
  async generateAccessToken(site_id) {
    // this.paypalConfig(site_id);
    const response = await this.postAndReturnData('/v1/oauth2/token/');
    console.log('postAndReturnData', response);
    return response.report;
  }

  // use the orders api to create an order
  async createOrder(req) {
    const site_id = req.headers.site_id || 1;
    const accessToken = await this.generateAccessToken(site_id);
    console.log('accessToken', accessToken);
    const payload = JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '20.00',
          },
        },
      ],
    });
    const data = await this.postWithPayload(
      this.baseURL.sandbox + '/v2/checkout/orders',
      accessToken,
      payload
    );
    console.log('createOrder', data);
    return data;
  }

  // use the orders api to capture payment for an order
  async capturePayment(req) {
    const site_id = req.headers.site_id || 1;
    const accessToken = await this.generateAccessToken(site_id);
    console.log(req.body.order_id);
    const data = await this.postWithPayload(
      '/v2/checkout/orders/' + req.body.order_id + '/capture/',
      accessToken
    );
    console.log('capturePayment', data);
    //send notification to member

    return data;
  }

  //store in transaction
  async successPayment(req) {
    const member_id = req.body.member_id || null;
    const member = await Member.findOne({ where: { id: member_id } });
    const transaction_obj = {
      member_id: member_id,
      amount: req.body.payout_amount,
      note: 'Cash withdrawn',
      type: parseFloat(req.body.payout_amount) > 0 ? 'credited' : 'withdraw',
      amount_action: 'admin_adjustment',
      created_by: req.user.id,
      transaction_id: req.body.transaction_id || null,
      payload: req.body ? JSON.stringify(req.body) : null,
    };
    console.log('transaction_obj', transaction_obj);
    let result = await MemberTransaction.updateMemberTransactionAndBalance(
      transaction_obj
    );
    if (result.status) {
      const withdrawal_req_obj = {};

      console.log('withdrawal_req_obj', withdrawal_req_obj);
      let result = await WithdrawalRequest.update(withdrawal_req_obj, {
        where: { id: req.body.request_id },
      });
      const member_name = member.first_name + ' ' + member.last_name;
      //email
      const eventBus = require('../eventBus');
      //send mail to admin
      let adminEventbus = eventBus.emit('send_email', {
        action: 'Member Cash Withdrawal',
        data: {
          email: req.user.email,
          details: {
            desc:
              member_name +
              ' has withdrawn $' +
              req.body.payout_amount +
              ' on ' +
              req.body.date,
          },
        },
        req: req,
      });
      //send mail to admin
      let memberEventbus = eventBus.emit('send_email', {
        action: 'Withdrawal Approval',
        data: {
          email: member.email,
          details: {
            desc:
              'Admin has approved your withdrawn request of $' +
              req.body.payout_amount +
              ' on ' +
              req.body.date,
          },
        },
        req: req,
      });
    }
  }

  async handleResponse(response) {
    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
  }

  //paypal payout
  async paypalPayout(){
    // let clientId = "AevkQd7_MKUI6mSpcLXyL0MXYwxY_Y5vy8-fQG4IowQuHRXwk9dXQnqm7wqlfPAx2MkcFeuJwlcKl6-6";
    // let clientSecret = "EK-L43SaFqcrTtmRgABvcZHVUToVoHxMtOGeIBkk-TdWKDg4lirK-PZ7zcZq0F26LwiWDVPf4a4VLaBv";
    // let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    // let client = new paypal.core.PayPalHttpClient(environment);

    // let requestBody = {
    //     "sender_batch_header": {
    //       "recipient_type": "EMAIL",
    //       "email_message": "SDK payouts test txn",
    //       "note": "Enjoy your Payout!!",
    //       "sender_batch_id": "Test_sdk_1",
    //       "email_subject": "This is a test transaction from SDK"
    //     },
    //     "items": [{
    //       "note": "Demo note",
    //       "amount": {
    //         "currency": "USD",
    //         "value": "1.00"
    //       },
    //       "receiver": "sb-qk43ey25302643@personal.example.com",
    //       "sender_item_id": "Test_txn_1"
    //     }]
    //   }

    // // Construct a request object and set desired parameters
    // try{
    // // Here, PayoutsPostRequest() creates a POST request to /v1/payments/payouts
    //   let request = new paypal.payouts.PayoutsPostRequest();
    //   request.requestBody(requestBody);

    //   // Call API with your client and get a response for your call
    //   let response = await client.execute(request);
    //   console.log(`Response: ${JSON.stringify(response)}`);
    //   // If call returns body in response, you can get the deserialized version from the result attribute of the response.
    //   console.log(`Payouts Create Response: ${JSON.stringify(response.result)}`);
    //   return{
    //     status: true,
    //     result: response.result
    //   }

    // }catch(e){
    //   return{
    //     status: false,
    //     error:e
    //   }
    // }


    
    // Create auth token with API
    try{
      const response = await axios.post(
        `https://api-m.sandbox.paypal.com/v1/oauth2/token`,
        {
          grant_type: 'client_credentials',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: "AevkQd7_MKUI6mSpcLXyL0MXYwxY_Y5vy8-fQG4IowQuHRXwk9dXQnqm7wqlfPAx2MkcFeuJwlcKl6-6",
            password: "EK-L43SaFqcrTtmRgABvcZHVUToVoHxMtOGeIBkk-TdWKDg4lirK-PZ7zcZq0F26LwiWDVPf4a4VLaBv",
          },
        },
      );
      // make Paypal API calls with your access token here!!
    const authToken = response.data.access_token;
    //make bulk payout request 
    const result = await axios.post(
      `https://api-m.sandbox.paypal.com/v1/payments/payouts`,
      {
        sender_batch_header: {
          recipient_type: 'EMAIL',
          email_subject: 'You have a payout!',
          email_message:
            'You have received a payout! Thanks for using our service!',
        },
        items: [
          {
            receiver: 'sb-qk43ey25302643@personal.example.com',
            amount: {
              value: 0.8,
              currency: 'USD',
            },
          },
          // add more payout items here as you need
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

      return {
        status:true,
        result:result
      }
    }catch(e){
      return {
        status: false,
        error: e
      }
    }
    
    

    
  }
}

module.exports = Paypal;
