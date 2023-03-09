const { Member, CompanyPortal } = require("../models");
module.exports = async function (req, res, next) {
    const dev_mode = process.env.DEV_MODE || '1';
    if (dev_mode === '1') {
        var company_portal = await CompanyPortal.findByPk(1);
    } else {
        console.log('hostname', req.hostname);
        var company_portal = await CompanyPortal.findOne({ where: { domain: req.hostname } });
    }
    req.session.company_portal = company_portal;
    if ('member' in req.session && req.session.member) {
        const member = await Member.findOne({ where: { id: req.session.member.id } });
        req.session.member = member;
    }
    next();
}