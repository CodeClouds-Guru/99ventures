const axios = require('axios');
const { Country } = require('../models/index');
const handler = {
  get(target, prop) {
    return !(prop in target)
      ? target[prop]
      : function (...args) {
          try {
            return target[prop].apply(this, args);
          } catch (e) {
            return {
              status: false,
              error: e.message,
            };
          }
        };
  },
};
class Cint {
  constructor() {
    this.instance = axios.create({
      baseURL: 'http://www.your-surveys.com/',
      timeout: 10000,
      headers: {
        Authorization: process.env.CINT_API_KEY,
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
    });
    return new Proxy(this, handler);
  }
  async fetchAndReturnData(partUrl) {
    const response = await this.instance.get(partUrl);
    return response.data;
  }
  async createData(partUrl, payload) {
    this.instance = {
      ...this.instance,
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      data: payload,
    };

    const response = await this.instance.post(partUrl);
    return response.data;
  }
  async updateData(partUrl, payload) {
    this.instance = {
      ...this.instance,
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      data: payload,
    };

    const response = await this.instance.put(partUrl);
    return response.data;
  }
  async deleteData(partUrl) {
    const response = await this.instance.del(partUrl);
    return response.data;
  }
}

module.exports = Cint;
