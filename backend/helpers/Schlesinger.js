const axios = require('axios');

class Schlesinger {
	constructor() {
		this.instance = {
			timeout: 20000,
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				'X-MC-SUPPLY-KEY': process.env.SCHLESINGER_ACCESS_TOKEN
			},
		};
		
		this.fetchSellerAPI = this.fetchSellerAPI.bind(this);
		this.fetchDefinitionAPI = this.fetchDefinitionAPI.bind(this);
	}

	/**
	 * This is for the seller API
	 */
	async fetchSellerAPI(partUrl) {
		const instance = axios.create({
			...this.instance,
			baseURL: process.env.SCHLESINGER_SUPPLY_API_BASEURL
		});
		const response = await instance.get(partUrl);
		return response.data;
	}

	/**
	 * This is for the definition API
	 */
	async fetchDefinitionAPI(partUrl) {
		const instance = axios.create({
			...this.instance,
			baseURL: process.env.SCHLESINGER_DEFINITION_API_BASEURL
		});
		
		const response = await instance.get(partUrl);
		return response.data;
	}	

	getQuestionType(id) {
		const questionType = {
			1: 'singlepunch',
			2: 'multipunch',
			3: 'open-ended',
			4: 'dummy',
			5: 'calculated-dummy',
			6: 'range',
			7: 'emailType',
			8: 'info',
			9: 'compound',
			10: 'calendar',
			11: 'single-punch-image',
			12: 'multi-punch-image',
			14: 'videoType'
		}
		return questionType[id];
	}
}

module.exports = Schlesinger;
