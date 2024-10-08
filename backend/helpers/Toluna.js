const axios = require('axios');

class Toluna {
	constructor() {
		this.instance = {
			timeout: 50000,
			headers: {
				'Content-Type': 'application/json',
                Accept: 'application/json;version=2.0', // it's mandatory
			},
		};
        this.panelServiceAPI = `https://${process.env.IP_CORE_URL}/IntegratedPanelService/api`;
        this.utilitySurviceAPI = `https://${process.env.IP_REF_DATA_URL}/IPUtilityService/ReferenceData`;
        this.externalSamplingServiceApi = `https://${process.env.IP_ES_URL}/IPExternalSamplingService/ExternalSample/${process.env.PANEL_GUID}`;

		this.addMemebr = this.addMemebr.bind(this);
		this.getMember = this.getMember.bind(this);
		this.getQuestionsAnswer = this.getQuestionsAnswer.bind(this);
		this.getSurveys = this.getSurveys.bind(this);
	}

    /**
     * To Register a member
     * @param {Object} payload 
     * @returns 
     */
    async addMemebr(payload) {
        try{
            const instance = axios.create({
                ...this.instance,
                baseURL: this.panelServiceAPI,
            });
            var guid = '';
            if(payload.MemberCountryId === 225){
                guid = process.env.PARTNER_GUID_UK;
            } else if(payload.MemberCountryId === 226){
                guid = process.env.PARTNER_GUID;
            }
            delete payload.MemberCountryId;
            payload = {
                PartnerGUID: guid,
                ...payload
            }
            const response = await instance.post('/Respondent', payload);           
            return response;
        } catch(error) {
            console.error(error)
            if(error.response)
                throw error.response.data;
            else
                throw error
        }
    }

    /**
     * To get a member info
     * @param {string} memberCode 
     * @returns 
     */
    async getMember(memberCode, countryId) {
        var guid = '';
        if(countryId === 225){
            guid = process.env.PARTNER_GUID_UK;
        } else if(countryId === 226){
            guid = process.env.PARTNER_GUID
        }
        const baseURL = this.panelServiceAPI+'/Respondent/?partnerGUID='+guid+'&memberCode='+memberCode;
        const instance = axios.create({
            ...this.instance,
            baseURL
        });
        const response = await instance.get();
        return response.data;
    }

    /**
     * To update a member
     * @param {Object} payload 
     * @returns 
     */
    async updateMember(payload) {
        try{
            const instance = axios.create({
                ...this.instance
            });
            var guid = '';
            if(payload.MemberCountryId === 225){
                guid = process.env.PARTNER_GUID_UK;
            } else if(payload.MemberCountryId === 226){
                guid = process.env.PARTNER_GUID;
            }
            delete payload.MemberCountryId;
            delete payload.Email;
            payload = {
                PartnerGUID: guid,
                ...payload
            }

            const response = await instance.put(this.panelServiceAPI + '/Respondent', payload);
            return response;
        } catch(error) {
            console.error(error)
            throw error.response.data;
        }
    }

    /**
     * To Get All the questions & answer
     * @param {Object} payload 
     * @returns 
     */
    async getQuestionsAnswer(payload) {
        const instance = {
            headers: { 
                'PARTNER_AUTH_KEY': process.env.PARTNER_AUTH_KEY,
                'Content-Type': 'application/json',
            },
            timeout: 20000 
          };
          
        const response = await axios.post(
            this.utilitySurviceAPI +'/QuestionsAndAnswersData', 
            payload, 
            instance
        )
        .catch(err => {
            throw err;
        });
        return response.data;
    }

    /**
     * Get Surveys
     * @param {string} memberCode 
     * @returns 
     */
    async getSurveys(memberCode, countryId) {
        var guid = '';
        if(countryId === 225){
            guid = process.env.PARTNER_GUID_UK;
        } else if(countryId === 226){
            guid = process.env.PARTNER_GUID
        }
       
        const params = `memberCode=${memberCode}&partnerGuid=${guid}&numberOfSurveys=5&mobileCompatible=false&deviceTypeIDs=1&deviceTypeIDs=2`;
        const instance = axios.create({
            ...this.instance,
            baseURL: this.panelServiceAPI + '/Surveys?' + params
        });
        const response = await instance.get();
        return response.data;
    }

    /**** ES API *****/

    /**
     * Get Surveys, Quotas
     * 
     */
    async getQuotas(){
        const instance = axios.create({
            ...this.instance,
            baseURL: this.externalSamplingServiceApi + '/Quotas'
        });
        const response = await instance.get();
        return response.data;
    
    }
}

module.exports = Toluna;
