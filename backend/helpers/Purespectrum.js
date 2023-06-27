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

class Purespectrum {
	constructor() {
		this.instance = axios.create({
			baseURL: process.env.PURESPECTRUM_BASEURL,
			timeout: 30000,
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				'access-token': process.env.PURESPECTRUM_ACCESS_TOKEN
			},
		});
		this.fetchAndReturnData = this.fetchAndReturnData.bind(this);
		this.createData = this.createData.bind(this);
		this.getSurveyData = this.getSurveyData.bind(this);
		return new Proxy(this, handler);
	}

	async fetchAndReturnData(partUrl) {
		const response = await this.instance.get(partUrl);
		return response.data;
	}

	async getSurveyData(surveyNumber){
		const response = await this.instance.get('/surveys/' + surveyNumber);		
		if (
			'success' === response.data.apiStatus && 
			('survey' in response.data) && 
			+response.data.survey.survey_status === 22     // 22 means live
		) {
			return {
				is_active: true, 
				status: response.data.survey.survey_status, 
				data: response.data.survey
			}
		} else {
			return {
				is_active: false, 
				status: response.data.survey.survey_status
			};
		}
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

	getSurveyStatus(statusId) {
		const statusObj = {
			11: 'draft',
			22: 'live',
			33: 'paused',
			44: 'closed'
		}
		return statusObj[statusId];
	}

	getQuestionType(id) {
		const questionType = {
			1: 'singlepunch',
			2: 'singlepunch-alt',
			3: 'multipunch',
			4: 'range',
			5: 'open-ended',
			6: 'type 6'
		}
		return questionType[id];
	}
}

module.exports = Purespectrum;
