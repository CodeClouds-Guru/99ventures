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

    if (member.status !== 'validating') {
      req.session.flash = { error: "Please wait for admin approval to get into your account. For any other support please contact to our support team, they will help you." }
      res.redirect('/notice');
    }

    //get total earnings
    let total_earnings = await MemberBalance.findOne({
      where: { amount_type: 'cash', member_id: req.session.member.id },
      attribute: ['amount'],
    });

    //Transaction Stat
    let transaction_stat = await MemberTransaction.getTransactionCount(
      req.session.member.id
    );

    member.setDataValue('total_earnings', total_earnings.amount);
    member.setDataValue('transaction_today', transaction_stat.today);
    member.setDataValue('transaction_weekly', transaction_stat.week);
    member.setDataValue('transaction_monthly', transaction_stat.month);

    // console.log('-----------', member);
    req.session.member = member ? JSON.parse(JSON.stringify(member)) : null;
  }
  next();
};
