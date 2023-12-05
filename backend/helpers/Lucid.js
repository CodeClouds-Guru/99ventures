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
class Lucid {
  constructor() {
    this.instance = axios.create({
      baseURL: 'https://api.samplicio.us',
      timeout: 30000,
      headers: {
        Authorization: process.env.LUCID_API_KEY,
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
    });
    this.suppliers = this.suppliers.bind(this);
    this.fetchAndReturnData = this.fetchAndReturnData.bind(this);
    this.createData = this.createData.bind(this);
    this.updateData = this.updateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.createEntryLink = this.createEntryLink.bind(this);
    this.showQuota = this.showQuota.bind(this);
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

  /*********************** All GET Apis **********************/
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
  /*--------------- Demand - Qualifications ---------------*/
  //get qualifications
  async qualifications(survey_number) {
    const data = await this.fetchAndReturnData(
      'Demand/v1/SurveyQualifications/BySurveyNumber/' + survey_number
    );
    return data;
  }
  /*--------------- Demand - Qualifications ---------------*/

  //get allocated surveys
  async allocatedSurveys() {
    const data = await this.fetchAndReturnData(
      '/Supply/v1/Surveys/SupplierAllocations/All/6373'
    );
    return data;
  }

  /*------------------- Demand - Surveys --------------------*/
  //get survey
  async getSurvey(survey_number) {
    const data = await this.fetchAndReturnData(
      '/Demand/v1/Surveys/BySurveyNumber/' + survey_number
    );
    return data;
  }
  // get surveys by status
  async getSurveysByStatus(survey_status) {
    const data = await this.fetchAndReturnData(
      '/Demand/v1/Surveys/BySurveyStatus/' + survey_status
    );
    return data;
  }
  /*------------------- Demand - Surveys --------------------*/
  /*------------------- Demand - Quotas ---------------------*/
  // get surveys by status
  async quotas(survey_number) {
    const data = await this.fetchAndReturnData(
      '/Demand/v1/SurveyQuotas/BySurveyNumber/' + survey_number
    );
    return data;
  }
  /*------------------- Demand - Quotas ---------------------*/
  /*------------- Demand - Marketplace Templates ------------*/
  async marketplaceTemplates() {
    const data = await this.fetchAndReturnData(
      '/Demand/v1/ExchangeTemplates/GetAll'
    );
    return data;
  }
  /*------------- Demand - Marketplace Templates ------------*/
  /*--------------- Demand - Marketplace Groups -------------*/
  async surveyGroup(survey_number) {
    const data = await this.fetchAndReturnData(
      '/Demand/v1/SupplierGroups/BySurveyNumber/' + survey_number
    );
    return data;
  }
  /*--------------- Demand - Marketplace Groups -------------*/
  /*------------------ Demand - Allocations -----------------*/
  async allocations(survey_number) {
    const data = await this.fetchAndReturnData(
      '/Demand/v1/SupplierAllocations/BySurveyNumber/' + survey_number
    );
    return data;
  }
  /*------------------ Demand - Allocations -----------------*/
  /*-------------------- Demand - Recontact -----------------*/
  async qualifiedRespondents(survey_number, supplier_code) {
    const data = await this.fetchAndReturnData(
      '/Demand/v1/SurveyQualifiedRespondents/BySurveyNumberSupplierCode/' +
      survey_number +
      '/' +
      supplier_code
    );
    return data;
  }
  /*-------------------- Demand - Recontact -----------------*/
  /******************* END Of All GET Apis *******************/
  /*
   *
   */
  /**************** All Create and Update Apis ***************/
  /*------------------- Demand - Surveys --------------------*/
  //create survey
  async createSurvey(payload) {
    const data = await this.createData('Demand/v1/Surveys/Create', payload);
    return data;
  }
  //update survey
  async updateSurvey(payload) {
    const data = await this.updateData(
      'Demand/v1/Surveys/Update/' + payload.SurveyNumber,
      payload
    );
    return data;
  }
  //reconcile survey
  async reconcileSurvey(payload) {
    const data = await this.createData(
      'Demand/v1/Surveys/Reconcile/' + payload.SurveyNumber,
      payload
    );
    return data;
  }
  /*------------------ Demand - Surveys ---------------------*/
  /*--------------- Demand - Qualifications -----------------*/
  async createQualification(payload) {
    const data = await this.createData(
      '/Demand/v1/SurveyQualifications/Create/' + payload.SurveyNumber,
      payload
    );
    return data;
  }
  async updateQualification(payload) {
    const data = await this.updateData(
      '/Demand/v1/SurveyQualifications/Update/' + payload.SurveyNumber,
      payload
    );
    return data;
  }
  /*--------------- Demand - Qualifications -----------------*/
  /*------------------- Demand - Quotas ---------------------*/
  async createQuota(payload) {
    const data = await this.createData(
      '/Demand/v1/SurveyQuotas/Create/' + payload.SurveyNumber,
      payload
    );
    return data;
  }
  async updateQuota(payload) {
    const data = await this.updateData(
      '/Demand/v1/SurveyQuotas/Update/' + payload.SurveyNumber,
      payload
    );
    return data;
  }
  /*------------------- Demand - Quotas ---------------------*/
  /*------------- Demand - Marketplace Templates ------------*/
  async applyMarketplaceTemplate(payload) {
    const data = await this.createData(
      'Demand/v1/ExchangeTemplates/ApplyToSurvey/' +
      payload.SurveyNumber +
      '/' +
      payload.ExchangeTemplateId,
      payload
    );
    return data;
  }
  /*------------- Demand - Marketplace Templates ------------*/
  /*--------------- Demand - Marketplace Groups -------------*/
  async createMarketplaceGroupWithSuppliers(payload) {
    const data = await this.createData(
      '/Demand/v1/SupplierGroups/CreateWithSuppliers/' + payload.SurveyNumber,
      payload
    );
    return data;
  }
  async createMarketplaceEmptyGroupWithoutSuppliers(payload) {
    const data = await this.createData(
      '/Demand/v1/SupplierGroups/Create/' + payload.SurveyNumber,
      payload
    );
    return data;
  }
  async updateMarketplaceGroup(payload) {
    const data = await this.updateData(
      '/Demand/v1/SupplierGroups/Update/' + payload.SurveyNumber,
      payload
    );
    return data;
  }
  async addSuppliersToGroup(payload) {
    const data = await this.createData(
      '/Demand/v1/SupplierGroups/AddSuppliersToGroup/' +
      payload.SurveyNumber +
      '/' +
      payload.SupplierGroupID,
      payload
    );
    return data;
  }
  async removeFromMarketplaceGroup(payload) {
    const data = await this.createData(
      '/Demand/v1/SupplierGroups/RemoveSuppliersFromGroup/' +
      payload.SurveyNumber,
      payload
    );
    return data;
  }
  /*--------------- Demand - Marketplace Groups -------------*/
  /*------------------- Demand - Allocations ----------------*/
  async createAllocation(payload) {
    const data = await this.createData(
      '/Demand/v1/SupplierAllocations/Create/' + payload.SurveyNumber,
      payload
    );
    return data;
  }
  async updateAllocation(payload) {
    const data = await this.updateData(
      '/Demand/v1/SupplierAllocations/Update/' + payload.SurveyNumber,
      payload
    );
    return data;
  }
  /*------------------- Demand - Allocations ----------------*/
  /*------------------- Demand - Entry Links ----------------*/
  async createLink(payload) {
    const data = await this.createData(
      '/Demand/v1/SupplierAllocations/Targets/Create/' +
      payload.SurveyNumber +
      '/' +
      payload.SupplierCode,
      payload
    );
    return data;
  }
  async updateLink(payload) {
    const data = await this.updateData(
      '/Demand/v1/SupplierAllocations/Targets/Update/' +
      payload.SurveyNumber +
      '/' +
      payload.SupplierCode,
      payload
    );
    return data;
  }
  /*------------------- Demand - Entry Links ----------------*/
  /*-------------------- Demand - Recontact -----------------*/
  async updateQualifiedRespondents(payload) {
    const data = await this.updateData(
      '/Demand/v1/SurveyQualifiedRespondents/Update/' +
      payload.SurveyNumber +
      '/' +
      payload.SupplierCode,
      payload
    );
    return data;
  }
  /*-------------------- Demand - Recontact -----------------*/
  /*------------------ Demand - Survey Groups ---------------*/
  async createSurveyGroup(payload) {
    const data = await this.createData('/Demand/v1/SurveyGroups/', payload);
    return data;
  }
  async addToSurveyGroup(payload) {
    const data = await this.createData('/Demand/v1/SurveyGroups/', payload);
    return data;
  }
  async updateSurveyGroup(payload) {
    const data = await this.updateData('/Demand/v1/SurveyGroups/', payload);
    return data;
  }
  /*------------------ Demand - Survey Groups ---------------*/
  /************ END Of All Create and Update Apis ************/
  /*
   *
   */
  /*********************** All Del Apis **********************/
  /*--------------- Demand - Marketplace Groups -------------*/
  async deleteGroup(payload) {
    const data = await this.deleteData(
      '/Demand/v1/SupplierGroups/Delete/' +
      payload.SurveyNumber +
      '/' +
      payload.SupplierGroupID
    );
    return data;
  }
  /*--------------- Demand - Marketplace Groups -------------*/
  /*------------------- Demand - Allocations ----------------*/
  async deleteAllocation(payload) {
    const data = await this.deleteData(
      '/Demand/v1/SupplierAllocations/Delete/' +
      payload.SurveyNumber +
      '/' +
      payload.SupplierCode
    );
    return data;
  }
  /*------------------- Demand - Allocations ----------------*/
  /*------------------- Demand - Entry Links ----------------*/
  async deleteLink(payload) {
    const data = await this.deleteData(
      '/Demand/v1/SupplierAllocations/Targets/Update/' +
      payload.SurveyNumber +
      '/' +
      payload.SupplierCode
    );
    return data;
  }
  /*------------------- Demand - Entry Links ----------------*/
  /******************* END Of All Del Apis *******************/

  /*------------------- Entry Link Create Start ----------------*/
  async createEntryLink(surveyNumber) {
    const payload = {
      "SupplierLinkTypeCode": "OWS",
      "TrackingTypeCode": "NONE"
    };

    const instance = {
      headers: {
        'Authorization': process.env.LUCID_API_KEY,
        'Content-Type': 'application/json',
      }
    };

    const response = await axios.post(
      'https://api.samplicio.us/Supply/v1/SupplierLinks/Create/' + surveyNumber + '/6373',
      payload,
      instance
    )
      .catch(err => {
        throw err;
      });

    return response;

  }
  /*------------------- Entry Link Create End ----------------*/


  /*------------------- Entry Link Get Start ----------------*/
  async getEntryLink(surveyNumber) {
    const instance = {
      headers: {
        'Authorization': process.env.LUCID_API_KEY,
        'Content-Type': 'application/json',
      }
    };

    const response = await axios.get(
      'https://api.samplicio.us/Supply/v1/SupplierLinks/BySurveyNumber/' + surveyNumber + '/6373',
      instance
    )
    .catch(err => {
      throw err;
    });
    return response.data;

  }
  /*------------------- Entry Link Get End ----------------*/

  /*------------------- Supply Integration - Quotas ---------------------*/
  async showQuota(surveyNumber) {
    // console.log(surveyNumber)
    const data = await this.fetchAndReturnData(
      '/Supply/v1/SurveyQuotas/BySurveyNumber/' + surveyNumber + '/6373'
    );
    return data;
  }
  /*------------------- Supply Integration - Quotas End---------------------*/

  /*------------------- Supply Integration - Survey Group ---------------------*/
  async getSurveyGroups(surveyNumber) {
    const data = await this.fetchAndReturnData(
      '/Supply/v1/Surveys/SurveyGroups/BySurveyNumber/' + surveyNumber + '/6373'
    );
    return data;
  }
  /*------------------- Supply Integration - Survey Group ---------------------*/


}

module.exports = Lucid;
