const axios = require('axios');
const { Console } = require('winston/lib/winston/transports');
const { MemberTransaction, PaymentMethodCredential } = require('../models');
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
    const instance = axios.create({
      baseURL: this.baseURL.sandbox,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json, text/plain, */*',
        Authorization: `Basic ${this.auth}`,
      },
    });
    const response = await instance.post(
      partUrl,
      'grant_type=client_credentials'
    );
    return response;
  }

  async postWithPayload(partUrl, accessToken, payload = '') {
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
    return jsonData;
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
    const jsonData = await this.handleResponse(response);
    return jsonData.access_token;
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
    return data;
  }

  //store in transaction
  async capturePayment(req) {
    const member_id = req.body.member_id || null;
    const member = await Member.findOne({ where: { id: member_id } });
    const transaction_obj = {
      member_id: member_id,
      amount: req.body.payout_amount,
      note: 'Cash withdrawn',
      type: parseFloat(req.body.payout_amount) > 0 ? 'credited' : 'withdraw',
      amount_action: 'admin_adjustment',
      created_by: req.user.id,
      payload: req.body ? JSON.stringify(req.body) : null,
    };
    console.log('transaction_obj', transaction_obj);
    let result = await MemberTransaction.updateMemberTransactionAndBalance(
      transaction_obj
    );
    const member_name = member.first_name + ' ' + member.last_name;
    //send mail
    const eventBus = require('../eventBus');
    let evntbus = eventBus.emit('send_email', {
      action: 'Member Cash Withdrawal',
      data: {
        email: req.user.email,
        details: {
          desc:
            member_name +
            ' has withdrawn ' +
            req.body.payout_amount +
            ' on ' +
            req.body.date,
        },
      },
      req: req,
    });
  }

  async handleResponse(response) {
    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
  }
}

module.exports = Paypal;
