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

class Schlesinger {
	constructor() {
		this.instance = {
			timeout: 20000,
			headers: {
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				'X-MC-SUPPLY-KEY': (process.env.DEV_MODE == 1) ? '1002:0466198A-A78B-4F6C-8CE2-4A79FBC8FA41' : '1581:4e297b6e-3f09-424b-ac5f-c1f39205241c'
			},
		};
		
		this.fetchSellerAPI = this.fetchSellerAPI.bind(this);
		this.fetchDefinitionAPI = this.fetchDefinitionAPI.bind(this);
		return new Proxy(this, handler);
	}

	/**
	 * This is for the seller API
	 */
	async fetchSellerAPI(partUrl) {
		const instance = axios.create({
			...this.instance,
			baseURL: (process.env.DEV_MODE == 1) ? 'https://api-hub.market-cube.com/supply-api-v2/' : 'https://api.sample-cube.com',
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
			baseURL: (process.env.DEV_MODE == 1) ? 'https://api-hub.market-cube.com/definition-api/' : 'https://definitions.sample-cube.com/',
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
