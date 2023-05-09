const axios = require('axios');
class VirtualIncentive {

    constructor() {
		this.instance = {
			timeout: 50000,
			headers: {
				'Content-Type': 'application/json',
                Authorization: 'Basic OTl2ZW50dXJlczgxNzY6MTh4dFNQR09wb28xQ0tsRlIyMXoxZG1BTnlSRVlmMjZQQXNhZDNhemNySk4zNkxWYW1DZkZqNU5NbVdUeTJxOQ=='
			},
            baseURL: 'https://rest.virtualincentives.com/v6/json'            
		};
        
		this.createOrder = this.createOrder.bind(this);
	}

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
                const payload = [];
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
                    payload.push(params)
                })
                // console.log(payload)
                // return payload;

                const instance = axios.create({
                    ...this.instance
                });
                const response = [];
                payload.forEach(async row => {
                    await instance.post('/orders', row);
                    
                });
                return response;
            }
            
        } catch(error) {
            console.error(error.response)
            return error;
        }
    }

}

module.exports = VirtualIncentive