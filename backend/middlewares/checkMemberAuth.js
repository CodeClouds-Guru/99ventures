const {
  Member,
  CompanyPortal,
  EmailAlert,
  MemberTransaction,
  MemberBalance,
} = require('../models');
module.exports = async function (req, res, next) {
  const dev_mode = process.env.DEV_MODE || '1';
  if (dev_mode === '1') {
    var company_portal = await CompanyPortal.findByPk(1);
  } else {
    console.log('hostname', req.hostname);
    var company_portal = await CompanyPortal.findOne({
      where: { domain: req.hostname },
    });
  }
  req.session.company_portal = company_portal;
  if ('member' in req.session && req.session.member) {
    const member = await Member.findOne({
      where: { id: req.session.member.id },
    });
    //get email alerts
    let email_alerts = await EmailAlert.getEmailAlertList(
      req.session.member.id
    );
    //get total earnings
    let total_earnings = await MemberBalance.findOne({
      where: { amount_type: 'cash', member_id: req.session.member.id },
      attribute: ['amount'],
    });

    //Transaction Stat
    let transaction_stat = await MemberTransaction.getTransactionCount(
      req.session.member.id
    );
    console.log('transaction_stat', transaction_stat);
    member.setDataValue('email_alert_list', email_alerts);
    member.setDataValue('total_earnings', total_earnings);
    member.setDataValue('transaction_stat', transaction_stat);

    console.log('-----------', member);
    req.session.member = member ? JSON.parse(JSON.stringify(member)) : null;
  }
  next();
};
