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
class LuciSupply {
  constructor() {
    this.instance = axios.create({
      baseURL: 'https://api.samplicio.us',
      timeout: 10000,
      headers: {
        Authorization: process.env.LUCID_API_KEY,
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
    });
    this.supplier_code = process.env.SUPPLIER_CODE;
    this.fetchAndReturnData = this.fetchAndReturnData.bind(this);
    this.createData = this.createData.bind(this);
    this.updateData = this.updateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
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

  /*------------------ Lookup - Definitions -----------------*/
  //get all suppliers
  async suppliers() {
    const data = await this.fetchAndReturnData(
      'Core/v1/Suppliers/AllWithAccount'
    );
    return data;
  }
  //get all definition - update country table to insert language details
  async definitions() {
    const data = await this.fetchAndReturnData(
      '/Lookup/v1/BasicLookups/BundledLookups/CountryLanguages,Industries,SampleTypes,StudyTypes,SupplierLinkTypes,SurveyStatuses'
    );
    let country = await Country.findAll({
      attributes: ['id', 'name'],
    });

    let languages = [];
    data.AllCountryLanguages.map((val) => {
      let lang = val.Name.split(' - ')[1].toLowerCase().trim();
      country.map((el) => {
        if (el.name.toLowerCase() === lang) {
          languages.push({
            id: el.id,
            name: el.name,
            language_id: val.Id,
            language_code: val.Code,
            language_name: val.Name,
          });
        }
      });
    });
    var resp = [];
    try {
      await Country.sync({ force: true });
      resp = await Country.bulkCreate(languages, {
        updateOnDuplicate: ['id'],
        // ignoreDuplicates: true,
      });
    } catch (error) {
      console.error(error);
    } finally {
      return resp;
    }
  }
  //get business units
  async businessUnits() {
    const data = await this.fetchAndReturnData('Core/v1/BusinessUnits/All');
    return data;
  }
  /*------------------ Lookup - Definitions -----------------*/
  /*--------------- Lookup - Question Library ---------------*/
  //get standard questions
  async standardQuestions(language_id) {
    const data = await this.fetchAndReturnData(
      '/Lookup/v1/QuestionLibrary/AllQuestions/' + language_id
    );
    return data;
  }
  //get custom questions
  async listOfCustomQuestions(language_id) {
    const data = await this.fetchAndReturnData(
      '/Lookup/v1/QuestionLibrary/AllCustomQuestionsByAccount/' + language_id
    );
    return data;
  }
  //get question text
  async questionText(language_id, question_id) {
    const data = await this.fetchAndReturnData(
      '/Lookup/v1/QuestionLibrary/AllCustomQuestionsByAccount/' +
        language_id +
        '/' +
        question_id
    );
    return data;
  }
  //get question options
  async questionOptions(language_id, question_id) {
    const data = await this.fetchAndReturnData(
      '/Lookup/v1/QuestionLibrary/AllQuestionOptions/' +
        language_id +
        '/' +
        question_id
    );
    return data;
  }
  /*--------------- Lookup - Question Library ---------------*/

  /******* Start - Supply Apis ******/
  async createOrUpdateOpportunitySubscription(payload) {
    const data = await this.createData(
      '/supply/opportunities/v1/subscriptions/' + this.supplier_code,
      payload
    );
    return data;
  }
  async getOpportunitySubscription() {
    const data = await this.fetchAndReturnData(
      '/supply/opportunities/v1/subscriptions/' + this.supplier_code
    );
    return data;
  }
  async deleteOpportunitySubscription() {
    const data = await this.deleteData(
      '/supply/opportunities/v1/subscriptions/' + this.supplier_code
    );
    return data;
  }
  async createOrUpdateOutcomeSubscription(payload) {
    const data = await this.createData(
      '/supply/respondent-outcomes/v1/subscriptions/' + this.supplier_code,
      payload
    );
    return data;
  }
  async getOutcomeSubscription() {
    const data = await this.fetchAndReturnData(
      '/supply/respondent-outcomes/v1/subscriptions/' + this.supplier_code
    );
    return data;
  }
  async deleteOutcomeSubscription() {
    const data = await this.deleteData(
      '/supply/respondent-outcomes/v1/subscriptions/' + this.supplier_code
    );
    return data;
  }
  async getSurveysGroups(survey_number) {
    const data = await this.fetchAndReturnData(
      '/Supply/v1/Surveys/SurveyGroups/BySurveyNumber/' +
        survey_number +
        '/' +
        this.supplier_code
    );
    return data;
  }
  async createEntryLink(payload) {
    const data = await this.createData(
      '/Supply/v1/SupplierLinks/Create/' +
        payload.survey_number +
        '/' +
        this.supplier_code,
      payload
    );
    return data;
  }
  async updateEntryLink(payload) {
    const data = await this.updateData(
      '/Supply/v1/SupplierLinks/Update/' +
        payload.survey_number +
        '/' +
        this.supplier_code,
      payload
    );
    return data;
  }
  async getEntryLink(survey_number) {
    const data = await this.fetchAndReturnData(
      '/Supply/v1/SupplierLinks/BySurveyNumber/' +
        survey_number +
        '/' +
        this.supplier_code
    );
    return data;
  }

  /******* End - Supply Apis ******/
}

module.exports = LuciSupply;
