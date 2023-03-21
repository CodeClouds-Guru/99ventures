const axios = require('axios');
const { Console } = require('winston/lib/winston/transports');
const { PaymentMethod, PaymentMethodCredential } = require('../models');
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
    this.instance = {
      ...this.instance,
      headers: {
        Authorization: `Basic ${this.auth}`,
      },
      body: 'grant_type=client_credentials',
    };

    const response = await this.instance.post(partUrl);
    console.log(response.data);
    return response.data;
    // const response = axios.create({
    //   baseURL: this.baseURL.sandbox + partUrl,
    //   timeout: 10000,
    //   // method: post,
    //   headers: {
    //     Authorization: `Basic ${this.auth}`,
    //   },
    //   body: 'grant_type=client_credentials',
    // });

    // console.log('accessToken', response);
    // return response;
  }

  async postWithPayload(partUrl, accessToken, payload) {
    const response = axios.create({
      baseURL: this.baseURL.sandbox + partUrl,
      timeout: 10000,
      // method: post,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      data: payload,
    });
    const jsonData = await this.handleResponse(response);
    return response;
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
    // const response = await this.postAndReturnData('/v1/oauth2/token/');
    // const jsonData = await this.handleResponse(response);
    // console.log('jsonData', jsonData);
    // return jsonData.access_token;
    // const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
    fetch(`${this.baseURL.sandbox}/v1/oauth2/token`, {
      method: 'post',
      body: 'grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${this.auth}`,
      },
    }).then((resp) => {
      console.log(resp);
    });
    return 'worked';
    // const jsonData = await handleResponse(response);
    // console.log('jsonData', jsonData);
    // return jsonData.access_token;
  }

  // use the orders api to create an order
  async createOrder(req) {
    const site_id = req.headers.site_id || 1;
    const accessToken = await this.generateAccessToken(site_id);
    console.log('accessToken', accessToken);
    // const payload = JSON.stringify({
    //   intent: 'CAPTURE',
    //   purchase_units: [
    //     {
    //       amount: {
    //         currency_code: 'USD',
    //         value: req.body.amount,
    //       },
    //     },
    //   ],
    // });
    // const data = await this.postWithPayload(
    //   this.baseURL.sandbox + '/v2/checkout/orders',
    //   accessToken,
    //   payload
    // );
    // return data;
  }

  // use the orders api to capture payment for an order
  async capturePayment(req) {
    const site_id = req.headers.site_id || 1;
    const accessToken = await this.generateAccessToken(site_id);
    const payload = {};
    const data = await this.postWithPayload(
      this.baseURL.sandbox + `/v2/checkout/orders/${req.body.order_id}/capture`,
      accessToken,
      payload
    );
    console.log('capturePayment', data);
    return data;
  }

  async handleResponse(response) {
    if (response.status === 200 || response.status === 201) {
      return response;
    }
  }
}

module.exports = Paypal;
