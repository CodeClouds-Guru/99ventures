const programs = require('../config/virtual_incentives.json');
const { Country, Member } = require('../models/index');
const {Op} = require('sequelize');

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
            console.log(payload)
            return payload;




            /*const memberIds = params.map(pr => pr.member_id)
            const members = await Member.findAll({
                attributes: ['id', 'country_id'],
                where: {
                    id: {
                        [Op.in]: memberIds
                    }
                },
                include: {
                    model: Country,
                    attributes: ['iso']
                }
            });
            
            const payload = {
                "order": {
                    "programid": program.programid,
                    "clientid": Date.now(),
                    "fulfillment": (params.length > 1) ? "bulk" : "individual",        
                    "accounts": []
                }
            };
            members.forEach(member => {
                let program = programs.find(pr => pr.country === member.country.iso);
                if(program){
                    let item = params.find(pr=> pr.member_id === member.id);
                    payload.order.accounts.push({
                        "firstname": member.first_name,
                        "lastname": member.last_name,
                        "email": member.email,
                        "sku": item.sku ? item.sku : program.products[0]['sku'],
                        "amount": item.amount     
                    });
                }
            });
            if(payload.order.accounts.length) {
                return payload;
                const instance = axios.create({
                    ...this.instance,
                    baseURL: this.baseURL,
                });
                const response = await instance.post('/orders', payload);           
                return response;
            } else {
                throw new Error('Payload');
            }*/
        } catch(error) {
            console.error(error)
            throw error.response;
        }
    }

}

module.exports = VirtualIncentive