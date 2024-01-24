class MembershipTierShiftListner {
  constructor() {
    this.listen = this.listen.bind(this);
  }
  async listen(payload) {
    const util = require('util');
    const { Member } = require('./models/index');

    return await Member.tierUpgrade(payload);
  }

  /**
   * Get Member Tier Data.
   * This Fn is to get membership tier rule config
   * @returns Member Tier rule array
   */
  async membershipTierRule() {
    const { MembershipTier, MemberShipTierRule } = require('../models/index');
    let model = await MembershipTier.findAll({
      where: { status: 'active' },
      include: {
        model: MemberShipTierRule,
        attributes: ['config_json'],
      },
    });
    let rule_statement = [];
    model.forEach(function (record, key) {
      rule_statement.push({
        [parseInt(record.id)]:
          record.MemberShipTierRule && record.MemberShipTierRule.config_json
            ? record.MemberShipTierRule.config_json.rule_config
            : '',
      });
    });
    return rule_statement;
  }

  /**
   * Evaluate Member Tier
   * This Fn is to evaluate member tier
   * @param member_id
   * @returns
   */
  async evaluateMemberTier(member_id) {
    const { Member } = require('../models/index');

    let member_tier_data = await Member.getMemberTierData(member_id);
    let membership_tier_rule = await this.membershipTierRule();

    console.log(member_tier_data);
    console.log(membership_tier_rule);
  }
}

module.exports = {
  event: 'membership_tier_shift',
  classname: MembershipTierShiftListner,
};
