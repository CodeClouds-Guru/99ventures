const axios = require('axios');
const { PaymentMethodCredential } = require('../models');

class VirtualIncentive {

    constructor(company_portal_id) {
        this.company_portal_id = company_portal_id;
        this.getInstance = this.getInstance.bind(this);
		this.createOrder = this.createOrder.bind(this);
	}

    async getInstance(){
        const credentials = await PaymentMethodCredential.findOne({
            attributes: ['slug', 'value'],
            where: {
                payment_method_id: 3,
                company_portal_id: this.company_portal_id,
            },
        });
        const instance = {
			timeout: 50000,
			headers: {
				'Content-Type': 'application/json',
                Authorization: 'Basic ' + credentials.value
			},
            baseURL: 'https://rest.virtualincentives.com/v6/json'            
		};
        return instance;
    }

    /**
     * To create orders
     * @param {Object} params 
     * @returns 
     */
    async createOrder(params) {
        try{
            const groupData = params.reduce((acc, item )=> {
                let key = item['program_id'];
                if (!acc[key]) {
                    acc[key] = []
                }
                acc[key].push(item)
                return acc
            }, {});

            if(Object.keys(groupData).length){
                var payload = [];
                Object.keys(groupData).forEach(data =>{
                    const params = {
                        "order": {
                            "programid": data,
                            "clientid": Date.now(),
                            "fulfillment": (groupData[data].length > 1) ? "bulk" : "individual",        
                            "accounts": []
                        }
                    };
                    groupData[data].forEach(row =>{
                        params.order.accounts.push({
                            "firstname": row.first_name,
                            "lastname": row.last_name,
                            "email": row.email,
                            "sku": row.sku,
                            "amount": row.amount     
                        });
                    });
                    console.log(params)
                    payload.push({[data]: params})
                });

                // console.log(payload)
                // return payload;
                const data = await this.getInstance();
                const instance = axios.create({
                    ...data
                });
                const response = {};
                for(const programid of payload) {
                    try{
                        var resp = await instance.post('/orders', payload[programid]);
                        resp = {status: true, response: resp}
                    }catch(e) {
                        var resp = {status: false, error: e}
                    }finally {
                        response[programid] = resp;
                    }
                }
                return response;
            }
            
        } catch(error) {
            console.error(error.response)
            throw error;
        }
    }

    async getProgramBalance(){
        try{
            const data = await this.getInstance();
            const instance = axios.create({
                ...data
            });
            const response = await instance.get('/balances/programs');
            return response.data
        }
        catch(error) {
            console.error(error);
            return error;
        }
    }

    /**
     * To get the orders
     */
    async getOrders(){
        try{
            const data = await this.getInstance();
            const instance = axios.create({
                ...data
            });
           
            const response = await instance.get('/orders');
            return response.data
        }
        catch(error) {
            console.error(error);
            return error;
        }
    }

}

module.exports = VirtualIncentive