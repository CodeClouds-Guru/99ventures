const axios = require('axios');

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

class Toluna {
	constructor() {
		this.instance = {
			timeout: 50000,
			headers: {
				'Content-Type': 'application/json',
			},
		};
        this.panelSurviceAPI = `https://${process.env.IP_CORE_URL}/IntegratedPanelService/api`;
        this.utilitySurviceAPI = `https://${process.env.IP_REF_DATA_URL}/IPUtilityService/ReferenceData`;

		this.addMemebr = this.addMemebr.bind(this);
		this.getQuestionsAnswer = this.getQuestionsAnswer.bind(this);
		this.getSurveys = this.getSurveys.bind(this);
		return new Proxy(this, handler);
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
                baseURL: this.panelSurviceAPI,
            });
            const response = await instance.post('/Respondent', payload);           
            return response;
        } catch(error) {
            console.error(error.response.data)
            throw error.response.data;
        }
    }

    /**
     * To get a member info
     * @param {string} memberCode 
     * @returns 
     */
    async getMember(memberCode) {
        const baseURL = this.panelSurviceAPI+'/Respondent/?partnerGUID='+process.env.PARTNER_GUID+'&memberCode='+memberCode;
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
        const instance = axios.create({
            ...this.instance,
            baseURL: this.panelSurviceAPI + '/Respondent',
            data: payload,
        });
        const response = await instance.put();
        return response.data;
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
    async getSurveys(memberCode) {
        const params = `memberCode=${memberCode}&partnerGuid=${process.env.PARTNER_GUID}&numberOfSurveys=5&mobileCompatible=false&deviceTypeIDs=1&deviceTypeIDs=2`;
        const instance = axios.create({
            ...this.instance,
            baseURL: this.panelSurviceAPI + '/Surveys?' + params
        });
        const response = await instance.get();
        return response.data;
    }
}

module.exports = Toluna;
