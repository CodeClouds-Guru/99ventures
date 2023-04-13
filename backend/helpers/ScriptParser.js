const Models = require('../models');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const safeEval = require('safe-eval');
const util = require("util")
class ScriptParser {
  constructor() {
    this.parseScript = this.parseScript.bind(this);
    this.getModuleWhere = this.getModuleWhere.bind(this);
    // this.getOfferWallList = this.getOfferWallList.bind(this);
    // this.getTicketList = this.getTicketList.bind(this);
  }
  async parseScript(script_id, user, params) {
    var data = [];
    var page_count = 0
    var script_html = '';
    let script = await Models.Script.findOne({ where: { code: script_id } });
    if (script) {
      script_html = script.script_html;
      if (script.module) {
        switch (script.action_type) {
          case 'list':
            const perPage = 'perpage' in params ? parseInt(params.perpage) : 12;
            const orderBy = 'orderby' in params ? params.orderby : 'id';
            const order = 'order' in params ? params.order : 'desc';
            const pageNo = 'pageno' in params ? parseInt(params.pageno) : 1;
            // console.log({
            //   ...where,
            //   order: [[Sequelize.literal(orderBy), order]],
            //   limit: perPage,
            //   offset: (pageNo - 1) * perPage,
            //   include: { all: true }
            // })
            const param_where =
              'where' in params
                ? JSON.parse(params.where)
                : null;

            let where = this.getModuleWhere(script.module, user);

            if (param_where)
              where.where = {
                ...where.where,
                ...param_where,
              };

            console.log(where);
            data = await Models[script.module].findAll({
              subQuery: false,
              order: [[Sequelize.literal(orderBy), order]],
              limit: perPage,
              offset: (pageNo - 1) * perPage,
              ...where,
            });
            var data_count = await Models[script.module].findAndCountAll({...where})
            page_count = Math.ceil(data_count.count/perPage)
            // console.log(data);
            break;
          case 'profile_update':
            const member_where = this.getModuleWhere(script.module, user);
            data = await Models[script.module].findOne({
              ...member_where,
            });
            let email_alerts = await Models.EmailAlert.getEmailAlertList(
              user.id
            );
            data.setDataValue('email_alerts', email_alerts);
            let country_list = await Models.Country.getAllCountryList();
            data.setDataValue('country_list', country_list);
            // console.log(data.country_id);
            break;
        }
      }
    }
    
    return {
      data: JSON.parse(JSON.stringify(data)),
      script_html,
      page_count
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
          where: { id: user.id },
          include: { model: Models.MembershipTier, attributes: ['name'] },
        };
      default:
        return null;
    }
  }
}
module.exports = ScriptParser;
