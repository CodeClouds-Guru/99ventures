const Controller = require('./Controller');
const {
  Rule,
  MemberShipTierAction,
  MemberShipTierRule,
} = require('../../models/index');

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
  async save(req, res) {
    let company_portal_id = req.headers.site_id;
    req.body.company_portal_id = company_portal_id;
    // req.body.tier_details.logo = '';
    if (req.files) {
      let files = [];
      files[0] = req.files.image;
      const fileHelper = new FileHelper(files, 'membership-tiers', req);
      const file_name = await fileHelper.upload();
      req.body.tier_details.logo = file_name.files[0].filename;
    }
    //tier store
    const { error, value } = this.model.validate(req);
    if (error) {
      const errorObj = new Error('Validation failed.');
      errorObj.statusCode = 422;
      errorObj.data = error.details.map((err) => err.message);
      throw errorObj;
    }
    let request_data = req.body.tier_details;
    request_data.created_by = req.user.id;
    try {
      let tier_save = await this.model.create(request_data, { silent: true });

      //rule action store
      let membership_tier_rules = await this.formatTierRulesAndSave(
        req.body,
        tier_save.id
      );
      return {
        status: true,
        message: 'Record has been created successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async formatTierRulesAndSave(rule_obj, membership_tier_id) {
    let rule_save_obj = [];
    let rule_used = [];

    let rule_keys = Object.keys(rule_obj.rules_used);
    rule_keys.forEach(function async(record, key) {
      rule_save_obj.push({
        membership_tier_action_id: rule_obj.rules_used[record].action,
        operator: rule_obj.rules_used[record].operator,
        value: rule_obj.rules_used[record].value,
      });
      rule_used.push(rule_obj.rules_used[record].action);
      rule_obj.rules_config = rule_obj.rules_config.replace(
        '<<' + [record] + '>>',
        rule_obj.rules_used[record].variable
      );
    });

    let rule = await Rule.bulkCreate(rule_save_obj);

    let config_json_obj = {
      rule_used: rule_used,
      rule_config: rule_obj.rules_config,
      rule_statement: rule_obj.rules_statement,
    };
    let membership_tier_rule_obj = {
      membership_tier_id,
      config_json: JSON.stringify(config_json_obj),
    };

    let membership_tier_rules = await MemberShipTierRule.create(
      membership_tier_rule_obj
    );
    return true;
  }
}

module.exports = MembershipTierController;
