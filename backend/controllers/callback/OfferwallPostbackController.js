const {
  MemberTransaction,
  Member,
  OfferWall,
  CompanyPortal,
} = require('../../models');

class OfferwallPostbackController {
  constructor() { }
  async save(req, res) {
    //---- To Generate Log
    const logger1 = require('../../helpers/Logger')(
      `outcome-${req.params.offerwall}.log`
    );
    logger1.info(req.method);
    logger1.info(JSON.stringify(req.query));
    logger1.info(JSON.stringify(req.body));
    //----

    // console.log(req.params.offerwall);
    if (req.query.status === '1' || req.body.status === '1') {
      try {
        const offerwall_name = req.params.offerwall;
        let offerwall_details = await OfferWall.findOne({
          attributes: [
            'campaign_id_variable',
            'campaign_name_variable',
            'sub_id_variable',
            'postback_url',
            'currency_percent',
          ],
          where: { name: offerwall_name },
        });

        var currency_percent = offerwall_details.currency_percent || '100';
        currency_percent = parseFloat(currency_percent);
        if (
          offerwall_details &&
          (offerwall_details.campaign_id_variable in req.query ||
            offerwall_details.campaign_id_variable in req.body)
        ) {
          let username = req.query[offerwall_details.campaign_id_variable]
            ? req.query[offerwall_details.campaign_id_variable]
            : req.body[offerwall_details.campaign_id_variable];

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
          // console.log('member', member);

          if (member) {
            let payout_amount = 0;
            let note = '';
            if (
              offerwall_details.campaign_name_variable in req.query ||
              offerwall_details.campaign_name_variable in req.body
            ) {
              payout_amount = req.query[
                offerwall_details.campaign_name_variable
              ]
                ? parseFloat(
                  req.query[offerwall_details.campaign_name_variable]
                )
                : parseFloat(
                  req.body[offerwall_details.campaign_name_variable]
                );
            }

            if (
              offerwall_details.sub_id_variable in req.query ||
              offerwall_details.sub_id_variable in req.body
            ) {
              note = req.query[offerwall_details.sub_id_variable]
                ? req.query[offerwall_details.sub_id_variable]
                : req.body[offerwall_details.sub_id_variable];
            }

            payout_amount = (payout_amount * currency_percent) / 100;
            const transaction_obj = {
              member_id: member.id,
              amount: payout_amount,
              note: offerwall_name,
              type: 'credited',
              amount_action: 'survey',
              created_by: null,
              payload: req.body
                ? JSON.stringify(req.body)
                : JSON.stringify(req.query),
              status: 2
            };
            // console.log('transaction_obj', transaction_obj);
            let result =
              await MemberTransaction.updateMemberTransactionAndBalance(
                transaction_obj
              );

            res.send(
              Object.keys(req.body).length ? JSON.stringify(req.body) : JSON.stringify(req.query)
            );
            return;
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
    res.send({
      status: true,
      message: 'Completed'
    })
  }
}

module.exports = OfferwallPostbackController;
