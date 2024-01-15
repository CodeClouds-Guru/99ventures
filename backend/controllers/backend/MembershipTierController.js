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
    this.save = this.save.bind(this);
    this.update = this.update.bind(this);
    this.formatTierRulesAndSave = this.formatTierRulesAndSave.bind(this);
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

  //override save api
  async save(req, res) {
    let company_portal_id = req.headers.site_id;
    req.body.company_portal_id = company_portal_id;

    if (req.files) {
      let files = [];
      files[0] = req.files.logo;
      const fileHelper = new FileHelper(files, 'membership-tiers', req);
      const file_name = await fileHelper.upload();
      req.body.logo = file_name.files[0].filename;
    }
    //tier store
    const { error, value } = this.model.validate(req);
    if (error) {
      const errorObj = new Error('Validation failed.');
      errorObj.statusCode = 422;
      errorObj.data = error.details.map((err) => err.message);
      throw errorObj;
    }
    let request_data = req.body;
    request_data.created_by = req.user.id;
    request_data.reward_cash = req.body.cash || 0;
    request_data.reward_point = req.body.point || 0;
    request_data.status = 'active';

    // console.log(req.body);
    try {
      let tier_save = await this.model.create(request_data, { silent: true });

      //rule action store
      let membership_tier_rules = await this.formatTierRulesAndSave(
        JSON.parse(req.body.configuration),
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
    // console.log(rule_obj.rules_used);
    let rule_keys = Object.keys(rule_obj.rules_used);
    rule_keys.forEach(function async(record, key) {
      rule_save_obj.push({
        membership_tier_action_id: rule_obj.rules_used[record].action,
        operator: rule_obj.rules_used[record].operator,
        value: rule_obj.rules_used[record].value,
      });

      rule_obj.rules_config = rule_obj.rules_config.replace(
        `<<${[record]}>>`,
        ` ${rule_obj.rules_used[record].action_variable} `
      );
    });

    let rule = await Rule.bulkCreate(rule_save_obj);
    rule = rule.map((info) => {
      return info.id;
    });
    let config_json_obj = {
      rule_used: rule,
      rule_config: rule_obj.rules_config.trim(),
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

  async edit(req, res) {
    try {
      let model = await this.model.findOne({
        where: { id: req.params.id },
        include: {
          model: MemberShipTierRule,
        },
      });
      let rule_id = model.MemberShipTierRule
        ? model.MemberShipTierRule.config_json.rule_used
        : '';
      let get_rules = await Rule.findAll({ where: { id: rule_id } });

      model.setDataValue('rules', get_rules);
      console.log(model);
      let fields = this.model.fields;
      return { result: model, fields };
    } catch (error) {
      throw error;
    }
  }

  //override update api
  async update(req, res) {
    let company_portal_id = req.headers.site_id;
    req.body.company_portal_id = company_portal_id;
    let model = await this.model.findOne({
      where: { id: req.params.id },
      include: {
        model: MemberShipTierRule,
      },
    });
    console.log(model);
    if (req.files) {
      let files = [];
      files[0] = req.files.logo;
      const fileHelper = new FileHelper(files, 'membership-tiers', req);
      const file_name = await fileHelper.upload();
      req.body.logo = file_name.files[0].filename;

      let prev_image = model.logo;
      if (prev_image && prev_image != '') {
        let file_delete = await fileHelper.deleteFile(
          prev_image.replace(process.env.S3_BUCKET_OBJECT_URL, '')
        );
      }
    }

    //destroy tier rule config
    await MemberShipTierRule.destroy({
      where: { membership_tier_id: req.params.id },
    });
    //destroy rules
    // await this.model.destroy({ where: { id: modelIds } });
  }
}

module.exports = MembershipTierController;
