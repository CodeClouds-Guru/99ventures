const Models = require('../models');
const Sequelize = require('sequelize');
class ScriptParser {
  constructor() {
    this.parseScript = this.parseScript.bind(this);
    this.getModuleWhere = this.getModuleWhere.bind(this);
    // this.getOfferWallList = this.getOfferWallList.bind(this);
    // this.getTicketList = this.getTicketList.bind(this);
  }
  async parseScript(script_id, user, params) {
    var data = [];
    var script_html = '';
    let script = await Models.Script.findOne({ where: { code: script_id } });
    if (script) {
      script_html = script.script_html;
      if (script.module) {
        switch (script.action_type) {
          case 'list':
            const perPage = 'perPage' in params ? params.perpage : 12;
            const orderBy = 'orderBy' in params ? params.orderby : 'id';
            const order = 'order' in params ? params.order : 'desc';
            const pageNo = 'pageNo' in params ? params.pageno : 1;
            const where = this.getModuleWhere(script.module, user);
            // console.log({
            //   ...where,
            //   order: [[Sequelize.literal(orderBy), order]],
            //   limit: perPage,
            //   offset: (pageNo - 1) * perPage,
            //   include: { all: true }
            // })
            data = await Models[script.module].findAll({
              subQuery: false,
              order: [[Sequelize.literal(orderBy), order]],
              limit: perPage,
              offset: (pageNo - 1) * perPage,
              ...where,
            });
            break;
          case 'profile_update':
            const member_where = this.getModuleWhere(script.module, user);
            data = await Models[script.module].findOne({
              ...member_where,
            });
            data.email_alerts = await Models.EmailAlert.getEmailAlertList(
              user.id
            );
            data.country_list = await Models.Country.getAllCountryList();
            break;
        }
      }
    }
    return {
      data: JSON.parse(JSON.stringify(data)),
      script_html,
    };
  }
  getModuleWhere(module, user) {
    switch (module) {
      case 'Ticket':
        return { where: { member_id: user.id } };
      case 'MemberTransaction':
        return {
          include: { model: Models.Member },
          attributes: [
            'created_at',
            'id',
            'amount',
            [Sequelize.literal('Member.avatar'), 'avatar'],
            [Sequelize.literal('Member.username'), 'username'],
          ],
          where: { type: 'credited' },
        };
      case 'Member':
        return {
          include: { model: Models.MembershipTier, attributes: ['name'] },
        };
      default:
        return null;
    }
  }
}
module.exports = ScriptParser;