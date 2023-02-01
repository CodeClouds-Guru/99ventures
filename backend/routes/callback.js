const express = require('express');
const router = express.Router();
const logger = require('../helpers/Logger')();
const { MemberTransaction, Member, Offerwall } = require('../models/index');

router.get('/test-adgate', (req, res) => {
  console.dir(logger);
  logger.info(JSON.stringify(req.query));
  res.send(req.query);
});
router.get('/postback/:offerwall', async (req, res) => {
  console.log(req.params.offerwall);
  const offerwall_name = req.params.offerwall;
  let offerwall_details = await Offerwall.findOne({
    attributes: [
      'campaign_id_variable',
      'campaign_name_variable',
      'sub_id_variable',
    ],
    where: { name: offerwall_name },
  });

  let member = {};
  if (
    offerwall_details &&
    offerwall_details.campaign_id_variable in req.query
  ) {
    let username = req.query[offerwall_details.campaign_id_variable];

    member = await Member.findOne({
      attributes: ['id', 'username'],
      where: {
        username: req.query[offerwall_details.campaign_id_variable],
      },
    });
    if (member) {
      const payout_amount =
        offerwall_details.campaign_name_variable in req.query
          ? req.query[offerwall_details.campaign_name_variable]
          : 0;
      const note =
        offerwall_details.sub_id_variable in req.query
          ? req.query[offerwall_details.sub_id_variable]
          : '';
      const transaction_obj = {
        member_id: member ? member.id : null,
        amount: payout_amount,
        note: note,
        type: parseFloat(req.query.payout) > 0 ? 'credited' : 'withdraw',
        amount_action: 'survey',
        created_by: null,
      };
      console.log('transaction_obj', transaction_obj);
      let result = await MemberTransaction.updateMemberTransactionAndBalance(
        transaction_obj
      );
      res.send(req.query);
    }
  }
});
module.exports = {
  prefix: '/callback',
  router,
};
