const {
  MemberTransaction,
  Member,
  OfferWall,
  CompanyPortal,
} = require('../../models');

class OfferwallPostbackController {
  constructor() {}
  async save(req, res) {
    console.log(req.params.offerwall);
    if (req.query.status == '1') {
      try {
        const offerwall_name = req.params.offerwall;
        let offerwall_details = await OfferWall.findOne({
          attributes: [
            'campaign_id_variable',
            'campaign_name_variable',
            'sub_id_variable',
            'postback_url',
          ],
          where: { name: offerwall_name },
        });
        console.log('offerwall_details', offerwall_details);

        if (
          offerwall_details &&
          offerwall_details.campaign_id_variable in req.query
        ) {
          let username = req.query[offerwall_details.campaign_id_variable];

          let member = await Member.findOne({
            attributes: ['id', 'username'],
            where: {
              username: username,
            },
            include: {
              model: CompanyPortal,
              where: {
                domain: offerwall_details.postback_url,
              },
              required: true,
              attributes: ['id'],
            },
          });
          //console.log('member', member);

          if (member) {
            const payout_amount =
              offerwall_details.campaign_name_variable in req.query
                ? parseFloat(
                    req.query[offerwall_details.campaign_name_variable]
                  )
                : 0;
            const note =
              offerwall_details.sub_id_variable in req.query
                ? req.query[offerwall_details.sub_id_variable]
                : '';
            const transaction_obj = {
              member_id: member ? member.id : null,
              amount: payout_amount,
              note: note,
              type: parseFloat(payout_amount) > 0 ? 'credited' : 'withdraw',
              amount_action: 'survey',
              created_by: null,
              payload: JSON.stringify(req.query),
            };
            //console.log('transaction_obj', transaction_obj);
            let result =
              await MemberTransaction.updateMemberTransactionAndBalance(
                transaction_obj
              );
            res.send(req.query);
          }
        }
      } catch (err) {
        console.log(err.message);
        res.status(500).json({
          status: false,
          errors: 'Unable to save data',
        });
      }
    }
  }
}

module.exports = OfferwallPostbackController;
