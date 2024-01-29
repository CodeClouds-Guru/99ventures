'use strict';
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const Joi = require('joi');
module.exports = (sequelize, DataTypes) => {
  class MembershipTier extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MembershipTier.hasOne(models.MemberShipTierRule, {
        foreignKey: 'membership_tier_id',
      });
    }
  }
  MembershipTier.init(
    {
      name: DataTypes.STRING,
      logo: {
        type: DataTypes.TEXT,
        get() {
          let rawValue = this.getDataValue('logo') || null;
          // console.log('get rawValue==', rawValue);
          if (
            rawValue == null ||
            !rawValue ||
            rawValue == '' ||
            rawValue == 'null'
          ) {
            rawValue = rawValue;
          } else {
            let check_url = '';
            try {
              new URL(rawValue);
              check_url = true;
            } catch (err) {
              check_url = false;
            }
            // console.log('check_url', check_url);
            if (!check_url)
              rawValue = process.env.S3_BUCKET_OBJECT_URL + rawValue;
          }
          const publicURL =
            process.env.CLIENT_API_PUBLIC_URL || 'http://127.0.0.1:4000';
          // console.log('imageRawValue', rawValue);
          return rawValue ? rawValue : null;
        },
        set(value) {
          // console.log('set value===', value, value === 'null');
          if (value == '' || value == null || value === 'null')
            this.setDataValue('logo', null);
          else this.setDataValue('logo', value);
        },
      },
      status: DataTypes.STRING,
      reward_point: DataTypes.INTEGER,
      chronology: DataTypes.INTEGER,
      reward_cash: DataTypes.FLOAT,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'MembershipTier',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'membership_tiers',
    }
  );
  MembershipTier.validate = function (req) {
    const schema = Joi.object({
      name: Joi.string().required().label('Name'),
      logo: Joi.string().optional().label('Logo'),
      status: Joi.string().required().label('Status'),
      reward_point: Joi.optional().label('Reward Point'),
      reward_cash: Joi.optional().label('Reward Cash'),
    });
    return schema.validate(req.body.tier_details);
  };
  MembershipTier.fields = {
    id: {
      field_name: 'id',
      db_name: 'id',
      type: 'text',
      placeholder: 'Id',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    name: {
      field_name: 'name',
      db_name: 'name',
      type: 'text',
      placeholder: 'Name',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    logo: {
      field_name: 'logo',
      db_name: 'logo',
      type: 'text',
      placeholder: 'Logo',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    status: {
      field_name: 'status',
      db_name: 'status',
      type: 'text',
      placeholder: 'Status',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    reward_point: {
      field_name: 'reward_point',
      db_name: 'reward_point',
      type: 'text',
      placeholder: 'Reward Point',
      listing: false,
      show_in_form: true,
      sort: false,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    reward_cash: {
      field_name: 'reward_cash',
      db_name: 'reward_cash',
      type: 'text',
      placeholder: 'Reward Cash',
      listing: true,
      show_in_form: true,
      sort: false,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
  };

  /**
   * Tier Change.
   * This Fn is upgrade membership tier
   * @param {*} member_id
   * @returns Total Withdrawal Data object
   */
  MembershipTier.tierUpgrade = async (data) => {
    const db = require('../models');
    const { QueryTypes } = require('sequelize');
    if (data.length > 0) {
      var value_string = '';
      const replacements = [];
      const tier_ids = [];
      var member_id = null;

      //generating query to insert data in bridge table
      data.forEach((item) => {
        value_string += '(?, ?),';
        tier_ids.push(item.membership_tier_id);
        replacements.push(item.membership_tier_id);
        replacements.push(item.member_id);
        if (!member_id) {
          member_id = item.member_id;
        }
      });
      value_string = value_string.replace(/,*$/, '') + ';';

      //executing query to insert data in bridge table
      await db.sequelize.query(
        `INSERT INTO member_membership_tier (membership_tier_id, member_id) VALUES ${value_string}`,
        {
          type: QueryTypes.INSERT,
          replacements,
        }
      );

      //determining top order membership level to assign in member row
      const final_tier = await db.MembershipTier.findAll({
        where: { id: tier_ids },
        limit: 1,
        order: [['chronology', 'desc']],
      });
      // console.log('final_tier', final_tier);
      if (final_tier.length > 0 && member_id) {
        await db.Member.update(
          { membership_tier_id: final_tier[0].id },
          {
            where: {
              id: member_id,
            },
          }
        );
      }
      await db.MembershipTier.transactionUpdateOnTierUpgrade(
        tier_ids,
        member_id
      );
    }
    return true;
  };

  /**
   * Tier Change.
   * This Fn is to update Transaction Data On Tier Upgrade
   * @param {*} member_id
   * @returns Tier ids
   */
  MembershipTier.transactionUpdateOnTierUpgrade = async (
    tier_ids,
    member_id
  ) => {
    const db = require('../models');
    const updated_tiers = await db.MembershipTier.findAll({
      where: { id: tier_ids },
      attributes: ['id', 'reward_cash', 'name'],
    });
    console.log('updated_tiers', updated_tiers);
    let transaction_data = [];
    if (updated_tiers.length > 0) {
      for (let item of updated_tiers) {
        let get_member_balance = await db.MemberBalance.findOne({
          where: { member_id: member_id, amount_type: 'cash' },
          attributes: ['amount'],
        });

        let updated_amount =
          parseFloat(get_member_balance.amount) + parseFloat(item.reward_cash);
        transaction_data.push({
          member_id: member_id,
          amount: item.reward_cash,
          note: `Membership Tier Upgraded to ${item.name}`,
          type: 'credited',
          amount_action: 'membership_tier_shift',
          created_by: member_id || '',
          status: 2,
          completed_at: new Date(),
          balance: updated_amount,
          payload: null,
          currency: 'USD',
        });
        await db.MemberBalance.update(
          { amount: updated_amount },
          { where: { member_id: member_id, amount_type: 'cash' } }
        );
        await db.MemberNotification.addMemberNotification({
          member_id,
          action: 'membership_tier_shift',
          verbose: `Your tier has been upgraded to ${item.name}`,
        });
      }
      if (transaction_data.length > 0) {
        var transaction_resp = await db.MemberTransaction.bulkCreate(
          transaction_data
        );
      }
    }
    return true;
  };
  sequelizePaginate.paginate(MembershipTier);
  return MembershipTier;
};
