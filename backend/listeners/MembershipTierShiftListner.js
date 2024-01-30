// const { string } = require('joi');

class MembershipTierShiftListner {
  constructor() {
    this.listen = this.listen.bind(this);
    this.assignMembershipLevel = this.assignMembershipLevel.bind(this);
  }
  async listen(data) {
    return await this.assignMembershipLevel(data.member_id);
    // return await Member.tierUpgrade(payload);
  }

  async assignMembershipLevel(member_id) {
    const db = require('./models');
    const safeEval = require('safe-eval');
    const { QueryTypes } = require('sequelize');
    const rule_set = await this.membershipTierRule();
    const member_membership_tier_data = [];
    let member_membership_tier_ids = await db.sequelize.query(
      'SELECT membership_tier_id FROM member_membership_tier WHERE member_id = ?',
      {
        type: QueryTypes.SELECT,
        replacements: [member_id],
      }
    );
    member_membership_tier_ids = member_membership_tier_ids.map(
      (tier) => tier.membership_tier_id
    );
    for (const membership_tier in rule_set) {
      if (member_membership_tier_ids.includes(parseInt(membership_tier, 10))) {
        continue;
      }
      const dataset = await db.Member.getMemberTierData(member_id);
      console.log('dataset', dataset);
      console.log('rule_set', rule_set);
      console.log('member_membership_tier_ids', member_membership_tier_ids);

      if (safeEval(rule_set[membership_tier], dataset)) {
        member_membership_tier_data.push({
          member_id,
          membership_tier_id: membership_tier,
        });
      }
    }

    if (member_membership_tier_data.length > 0) {
      await db.MembershipTier.tierUpgrade(member_membership_tier_data);
    }
    return true;
  }

  /**
   * Get Member Tier Data.
   * This Fn is to get membership tier rule config
   * @returns Member Tier rule array
   */
  async membershipTierRule() {
    const { MembershipTier, MemberShipTierRule } = require('./models');
    let model = await MembershipTier.findAll({
      where: { status: 'active' },
      include: {
        model: MemberShipTierRule,
        attributes: ['config_json'],
      },
    });
    let rule_statement = {};
    model.forEach((record) => {
      rule_statement[record.id.toString()] =
        record.MemberShipTierRule && record.MemberShipTierRule.config_json
          ? record.MemberShipTierRule.config_json.rule_config
          : '';
    });
    return rule_statement;
  }

  /**
   * Evaluate Member Tier
   * This Fn is to evaluate member tier
   * @param member_id
   * @returns
   */
  // async evaluateMemberTier(member_id) {
  //   const { Member } = require('../models/index');

  //   let member_tier_data = await Member.getMemberTierData(member_id);
  //   let membership_tier_rule = await this.membershipTierRule();
  // }
}

module.exports = {
  event: 'membership_tier_shift',
  classname: MembershipTierShiftListner,
};
