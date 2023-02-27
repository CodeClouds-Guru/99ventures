const { Member } = require("../models");
module.exports = async function (req, res, next) {
    if ('member' in req.session && req.session.member) {
        const member = await Member.findOne({ where: { id: req.session.member.id } });
        req.session.member = member;
    }
    next();
}