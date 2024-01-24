const Controller = require('./Controller');
const {
  Rule,
  MemberShipTierAction,
  MemberShipTierRule,
  MembershipTier,
} = require('../../models/index');

const FileHelper = require('../../helpers/fileHelper');

class MembershipTierController extends Controller {
  constructor() {
    super('MembershipTier');
    this.save = this.save.bind(this);
    this.update = this.update.bind(this);
    this.formatTierRulesAndSave = this.formatTierRulesAndSave.bind(this);
    this.removeRulesOnUpdate = this.removeRulesOnUpdate.bind(this);
    this.isValidParentheses = this.isValidParentheses.bind(this);
  }

  //override list api
  async list(req, res) {
    const options = this.getQueryOptions(req);
    console.log(req);
    let type = req.query.type || null;
    if (type === 'chronology_update')
      options.attributes = [...options.attributes, 'chronology'];
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
    try {
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
      let rule_config = JSON.parse(req.body.configuration);

      let valid_parentheses = await this.isValidParentheses(
        rule_config.rules_config
      );
      if (valid_parentheses) {
        request_data.created_by = req.user.id;
        request_data.reward_cash = req.body.cash || 0;
        request_data.reward_point = req.body.point || 0;
        request_data.status = 'active';

        // console.log(req.body);

        let highest_chronology = await this.model.findOne({
          attributes: ['chronology'],
          order: [['id', 'desc']],
          limit: 1,
        });
        // console.log('highest_chronology', highest_chronology);
        request_data.chronology = highest_chronology.chronology + 1;
        let tier_save = await this.model.create(request_data, { silent: true });
        //rule action store
        let membership_tier_rules = await this.formatTierRulesAndSave(
          rule_config,
          tier_save.id
        );
        return {
          status: true,
          message: 'Record has been created successfully',
        };
      } else {
        return {
          status: false,
          message: 'Config rule is not set properly',
        };
      }
    } catch (error) {
      throw error;
    }
  }

  //override edit api
  async edit(req, res) {
    try {
      let model = await this.model.findOne({
        where: { id: req.params.id },
        include: {
          model: MemberShipTierRule,
          attributes: ['config_json'],
        },
      });
      console.log(model);
      let rule_id = model.MemberShipTierRule
        ? model.MemberShipTierRule.config_json.rule_used
        : '';
      let get_rules = await Rule.findAll({
        where: { id: rule_id },
        // include: { model: MemberShipTierAction },
      });

      model.setDataValue('rules', get_rules);
      let all_actions = await MemberShipTierAction.findAll({
        attributes: ['id', 'name', 'variable'],
      });
      model.setDataValue('rule_actions', all_actions);
      // console.log(model);
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
    let type = req.body.type || null;

    // console.log('update', model);
    try {
      if (type === 'chronology_update') {
        req.body.chronology_list.forEach(async function (record) {
          let model_update = await MembershipTier.update(
            { chronology: record.chronology },
            {
              where: { id: record.id },
            }
          );
        });
        return {
          status: true,
          message: 'Record has been updated successfully',
        };
      } else {
        let model = await this.model.findOne({
          where: { id: req.params.id },
          include: {
            model: MemberShipTierRule,
          },
        });
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
        } else {
          req.body.logo = model.logo;
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
        let rule_config = JSON.parse(req.body.configuration);

        let valid_parentheses = await this.isValidParentheses(
          rule_config.rules_config
        );
        if (valid_parentheses) {
          request_data.updated_by = req.user.id;
          request_data.reward_cash = req.body.cash || 0;
          request_data.reward_point = req.body.point || 0;
          request_data.status = 'active';
          let model_update = await this.model.update(request_data, {
            where: { id: req.params.id },
          });
          // console.log('request_data', rule_config);
          // return;
          //destroy tier rule config
          let remove_rules = await this.removeRulesOnUpdate(
            req.params.id,
            model
          );

          let membership_tier_rules = await this.formatTierRulesAndSave(
            rule_config,
            req.params.id
          );
          return {
            status: true,
            message: 'Record has been updated successfully',
          };
        } else {
          return {
            status: false,
            message: 'Config rule is not set properly',
          };
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async formatTierRulesAndSave(rule_obj, membership_tier_id) {
    let rule_save_obj = [];
    // console.log('rule_obj', rule_obj);

    let rule_keys = Object.keys(rule_obj.rules_used);
    rule_keys.forEach(function (record, key) {
      rule_save_obj.push({
        membership_tier_action_id: rule_obj.rules_used[record].action,
        operator: rule_obj.rules_used[record].operator,
        value: rule_obj.rules_used[record].value,
      });

      rule_obj.rules_config = rule_obj.rules_config.replaceAll(
        `<<${[record]}>>`,
        `${rule_obj.rules_used[record].action_variable} ${rule_obj.rules_used[record].operator} ${rule_obj.rules_used[record].value}`
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

  async removeRulesOnUpdate(membership_tier_id, model) {
    await MemberShipTierRule.destroy({
      where: { membership_tier_id: membership_tier_id },
      force: true,
    });
    //destroy rules
    let rule_id = model.MemberShipTierRule
      ? model.MemberShipTierRule.config_json.rule_used
      : '';
    await Rule.destroy({ where: { id: rule_id }, force: true });
  }

  async isValidRuleConfigString(str) {
    let operator_arr = ['&&', '||'];
    let error_arr = [];
    operator_arr.forEach(function (operator, key) {
      let rule_split_arr = text.split(operator);
      rule_split_arr.forEach(function (ele, key) {
        if (!ele.includes('<<Rule')) {
          error_arr.push(false);
        }
      });
    });
    if (error_arr.includes(false)) return false;
    else return true;
  }

  async isValidParentheses(str) {
    const stack = [];
    const pairs = {
      '(': ')',
      '[': ']',
      '{': '}',
    };

    for (let char of str) {
      if (pairs[char]) {
        stack.push(char);
      } else if (char === ')' || char === ']' || char === '}') {
        if (pairs[stack.pop()] !== char) {
          return false;
        }
      }
    }

    return stack.length === 0;
  }
}

module.exports = MembershipTierController;
