const {
  Member,
  CompanyPortal,
  EmailAlert,
  MemberTransaction,
  MemberBalance,
  Page,
  WithdrawalRequest,
} = require('../models');
const db = require('../models/index');
const { sequelize } = require('../models/index');
const { QueryTypes, Op } = require('sequelize');
module.exports = async function (req, res, next) {
  const dev_mode = process.env.DEV_MODE || '1';
  if (dev_mode === '1') {
    var company_portal = await CompanyPortal.findByPk(1);
  } else {
    var company_portal = await CompanyPortal.findOne({
      where: { domain: req.hostname },
    });
  }
  req.session.company_portal = company_portal;
  if ('member' in req.session && req.session.member) {
    const member = await Member.findOne({
      where: { id: req.session.member.id },
    });

    //get total earnings
    let total_withdraws = await MemberBalance.findOne({
      where: { amount_type: 'cash', member_id: req.session.member.id },
      attributes: ['amount'],
    });

    //total paid
    let total_paid = await db.sequelize.query(
      "SELECT sum(member_transactions.amount) as total FROM `member_transactions` LEFT JOIN withdrawal_requests ON withdrawal_requests.member_transaction_id = member_transactions.id WHERE member_transactions.amount_action = 'member_withdrawal' and member_transactions.type = 'withdraw' and member_transactions.member_id=? and withdrawal_requests.status = 'approved'",
      {
        replacements: [req.session.member.id],
        type: QueryTypes.SELECT,
      }
    );

    //login streak
    let login_streak = await db.sequelize.query(
      'SELECT MAX(streak) AS streak FROM ( SELECT member_id, `created_at`, DATEDIFF(NOW(), `created_at`), @streak := IF( DATEDIFF(NOW(), `created_at`) - @days_diff > 1, @streak, IF(@days_diff := DATEDIFF(NOW(), `created_at`), @streak+1, @streak+1)) AS streak FROM member_activity_logs CROSS JOIN (SELECT @streak := 0, @days_diff := -1) AS vars WHERE member_id = ? AND `created_at` <= NOW() ORDER BY `created_at` DESC) AS t;',
      {
        replacements: [req.session.member.id],
        type: QueryTypes.SELECT,
      }
    );
    // console.log('===================login_streak', login_streak);
    //Transaction Stat
    let transaction_stat = await MemberTransaction.getTransactionCount(
      req.session.member.id
    );

    member.setDataValue('total_withdraws', total_withdraws.amount);
    member.setDataValue('total_earnings', transaction_stat.total || 0.0);
    member.setDataValue('transaction_today', transaction_stat.today || 0.0);
    member.setDataValue('transaction_weekly', transaction_stat.week || 0.0);
    member.setDataValue('transaction_monthly', transaction_stat.month || 0.0);
    member.setDataValue('total_paid', Math.abs(total_paid[0].total) || 0.0);
    member.setDataValue('total_streak', login_streak[0].streak);
    req.session.member = member ? JSON.parse(JSON.stringify(member)) : null;

    //redirect to dashboard instead of home page if authenticated
    const auth_redirection_page = await Page.findOne({
      where: {
        company_portal_id: req.session.company_portal.id,
        after_signin: 1,
      },
    });
    const redirect = auth_redirection_page
      ? auth_redirection_page.slug
      : '/404';

    if (req.path === '/') {
      res.status(302).redirect(redirect);
      return;
    }
  }
  next();
};
