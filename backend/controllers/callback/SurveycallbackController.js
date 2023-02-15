const {
    MemberTransaction,
    Member,
} = require('../../models');

class SurveycallbackController{
    constructor() {}

    async save(req, res) {
        const logger1 = require('../helpers/Logger')(
            `outcome-${req.params.provider}.log`
        );
        // console.log('===================req', req);
        logger1.info(JSON.stringify(req.query));
        logger1.info(JSON.stringify(req.body));
        
        const provider = req.params.provider;
        if(provider === 'cint'){
            const username = req.params.ssi;
            const reward = req.params.reward;

            let member = await Member.findOne({
                attributes: ['id', 'username'],
                where: {
                    username: username,
                }
            });
            if (member) {
                const note = provider;
                const transaction_obj = {
                member_id: member ? member.id : null,
                amount: reward,
                note: note +' '+ req.params.status,
                type: 'credited' ,
                amount_action: 'survey',
                created_by: null,
                payload: JSON.stringify(req.query)
                };
                console.log('transaction_obj', transaction_obj);
                let result = await MemberTransaction.updateMemberTransactionAndBalance(
                transaction_obj
                );
                res.send(req.query);
            }
        }
    }
}
  
module.exports = SurveycallbackController;
  