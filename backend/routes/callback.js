const express = require('express');
const router = express.Router();
const logger = require('../helpers/Logger')();
const { MemberTransaction, Member } = require('../models/index');

router.get('/test-adgate', (req, res) => {
  console.dir(logger);
  logger.info(JSON.stringify(req.query));
  res.send(req.query);
});
router.get('/adgate-postback', async (req, res) => {
  console.log(req.query);
  //   {
  //     aff_sub: 'ccguruus',
  //     offer_id: '394737',
  //     vc_title: 'Offer to Test Postbacks',
  //     points: '75',
  //     status: '1',
  //     s1: 'ccguruus',
  //     payout: '1',
  //     offer_name: 'Offer Wall Postback Test Offer',
  //     event_id: 'cca682f4-4cac-4aab-b875-21a890ac975b',
  //     event_name: 'Postback Sent',
  //     s2: '',
  //     s3: '',
  //     s4: '',
  //     s5: '',
  //     conversion_id: '8b7dab6a7948ba1d68bcf3bf2238a229a',
  //     session_ip: '116.206.220.16',
  //     date: '2023-01-24',
  //     time: '10:54:33',
  //     random: '2133033595'
  //   }
  let member = {};
  if (req.query.s1 !== '') {
    member = await Member.findOne({
      attributes: ['id', 'username'],
      where: { username: req.query.s1 },
    });
  }
  let result = await MemberTransaction.updateMemberTransactionAndBalance({
    member_id: member ? member.id : null,
    amount: req.query.payout || 0,
    note: req.query.offer_name || '',
    type: parseFloat(req.query.payout) > 0 ? 'credited' : 'withdraw',
    amount_action: 'survey',
    created_by: null,
  });
  res.send(req.query);
});
module.exports = {
  prefix: '/callback',
  router,
};
