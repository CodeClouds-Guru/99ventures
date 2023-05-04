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

class VirtualIncentive {

    constructor() {
		this.instance = {
			timeout: 50000,
			headers: {
				'Content-Type': 'application/json',
			},
		};
        this.baseURL = 'https://rest.virtualincentives.com/v6/json';
		this.createOrder = this.createOrder.bind(this);
		return new Proxy(this, handler);
	}

    async createOrder(payload) {
        try{
            const instance = axios.create({
                ...this.instance,
                baseURL: this.baseURL,
            });
            const response = await instance.post('/orders', payload);           
            return response;
        } catch(error) {
            console.error(error.response.data)
            throw error.response.data;
        }
    }

}

module.exports = VirtualIncentive