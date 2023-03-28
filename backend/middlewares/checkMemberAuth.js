const {
  Member,
  CompanyPortal,
  EmailAlert,
  MemberTransaction,
  MemberBalance,
} = require('../models');
const { sequelize } = require('../models/index');
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

    // if (member.status === 'validating') {
    //   req.session.flash = { error: "Please verify your email to get into your account" }
    //   res.redirect('/notice');
    //   return;
    // }

    //get total earnings
    let total_withdraws = await MemberBalance.findOne({
      where: { amount_type: 'cash', member_id: req.session.member.id },
      attribute: ['amount'],
    });

    //Transaction Stat
    let transaction_stat = await MemberTransaction.getTransactionCount(
      req.session.member.id
    );

    member.setDataValue('total_withdraws', total_withdraws.amount);
    member.setDataValue('total_earnings', transaction_stat.total || 0.0);
    member.setDataValue('transaction_today', transaction_stat.today || 0.0);
    member.setDataValue('transaction_weekly', transaction_stat.week || 0.0);
    member.setDataValue('transaction_monthly', transaction_stat.month || 0.0);

    // console.log('-----------', member);
    req.session.member = member ? JSON.parse(JSON.stringify(member)) : null;
  }
  next();
};
