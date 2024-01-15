const Controller = require('./Controller');
const { Rule, MemberShipTierAction } = require('../../models/index');

const FileHelper = require('../../helpers/fileHelper');

class MembershipTierController extends Controller {
  constructor() {
    super('MembershipTier');
  }

  //override list api
  async list(req, res) {
    const options = this.getQueryOptions(req);
    console.log(options);
    const { docs, pages, total } = await this.model.paginate(options);
    return {
      result: { data: docs, pages, total },
      fields: this.model.fields,
    };
  }

  //override save api
  async add() {
    let all_actions = await MemberShipTierAction.findAll({
      attributes: ['id', 'name', 'variable'],
    });
    return {
      fields: this.model.fields,
      rule_actions: all_actions,
    };
  }

  //override list api
  // async save(req, res) {
  //   let company_portal_id = req.headers.site_id;
  //   req.body.company_portal_id = company_portal_id;

  //   if (req.files) {
  //     let files = [];
  //     files[0] = req.files.image;
  //     const fileHelper = new FileHelper(files, 'membership-tiers', req);
  //     const file_name = await fileHelper.upload();
  //     req.body.image = file_name.files[0].filename;
  //   }
  //   //tier store
  //   let tier_save = await super.save(req.body);
  //   let membership_tier_id = tier_save.result.id;

  //   //rule action store
  //   let membership_tier_rules = this.formatTierRulesAndSave(
  //     rule_obj,
  //     membership_tier_id
  //   );

  // }

  // async formatTierRulesAndSave(rule_obj, membership_tier_id) {
  //   rule_obj.forEach(function (record, key) {

  //     let rule = await Rule.create(req.body.rule_actions);
  //     let membership_tier_rules = await Rule.create(req.body.rule_actions);

  //     delete req.body.rule_actions;

  //     let membership_tier_rule_obj = {
  //       membership_tier_id,
  //       config_json: {},
  //     };
  //   })
  // }
}

module.exports = MembershipTierController;
