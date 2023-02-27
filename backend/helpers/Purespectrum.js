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

class Purespectrum {
	constructor() {
		this.instance = axios.create({
			baseURL: 'http://staging.spectrumsurveys.com/suppliers/v2/',
			timeout: 20000,
			headers: {
				//Authorization: process.env.CINT_API_KEY,
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				'access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzYzZkZmYxY2ZlNWEzMGI4ZTI4NjNjYiIsInVzcl9pZCI6IjI0MDgiLCJpYXQiOjE2NzM5Nzc4NDF9.nSZ01i3FsezOsunZmTxql3_QtS_jnaFWm4ZXfYFTtw4'
			},
		});
		this.fetchAndReturnData = this.fetchAndReturnData.bind(this);
		this.createData = this.createData.bind(this);
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

module.exports = Purespectrum;
