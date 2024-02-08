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
      send_email: DataTypes.TINYINT,
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
      // mime_type: DataTypes.STRING,
      color: DataTypes.STRING(255),
      description: DataTypes.STRING(255),
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
      logo: Joi.string().required().label('Logo'),
      status: Joi.string().required().label('Status'),
      reward_point: Joi.optional().label('Reward Point'),
      reward_cash: Joi.optional().label('Reward Cash'),
      send_email: Joi.optional().label('Send Email'),
      color: Joi.optional().label('Color'),
      description: Joi.optional().label('Description'),
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
    // console.log('transactionUpdateOnTierUpgrade', tier_ids);
    const updated_tiers = await db.MembershipTier.findAll({
      where: { id: tier_ids },
      attributes: ['id', 'reward_cash', 'name', 'send_email', 'logo'],
      order: [['chronology', 'asc']],
      // logging: console.log,
    });
    // console.log('updated_tiers', updated_tiers);
    let transaction_data = [];
    if (updated_tiers.length > 0) {
      for (let item of updated_tiers) {
        let member = await db.Member.findOne({
          where: { id: member_id },
          // attributes: ['first_name', 'last_name', 'username'],
          include: [
            {
              model: db.MemberBalance,
              as: 'member_amounts',
              attributes: ['amount'],
              where: { amount_type: 'cash' },
            },
            {
              model: MembershipTier,
            },
          ],
        });
        let verbose = `Congratulations ${member.username}, you're now a ${item.name} MoreSurveys member. `;
        if (item.reward_cash > 0) {
          let updated_amount =
            parseFloat(member.member_amounts[0].amount) +
            parseFloat(item.reward_cash);
          transaction_data.push({
            member_id: member_id,
            amount: item.reward_cash,
            note: `${item.name}`,
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

          verbose += `You have been rewarded $${item.reward_cash} for reaching this level. `;
        }
        verbose += `<a href='/membership-levels'>Click here</a> to find out more about MoreSurveys membership levels. `;

        await db.MemberNotification.addMemberNotification({
          member_id,
          action: 'membership_tier_shift',
          verbose: verbose,
        });
        // console.log('item.send_email', item.dataValues.send_email);

        if (item.dataValues.send_email == 1) {
          await MembershipTier.sendEmailOnTierUpgrade(
            {
              member,
              current_level: item,
            },
            {
              headers: {
                company_id: member.company_id,
                site_id: member.company_portal_id,
              },
            }
          );
        }
      }
      if (transaction_data.length > 0) {
        var transaction_resp = await db.MemberTransaction.bulkCreate(
          transaction_data
        );
      }
    }
    return true;
  };
  MembershipTier.sendEmailOnTierUpgrade = async (data, req) => {
    //send mail
    // console.log('sendEmailOnTierUpgrade', data.current_level);
    const eventBus = require('../eventBus');
    let evntbus = eventBus.emit('send_email', {
      action: 'Membership Level Upgrade',
      data: {
        email: data.member.email,
        details: {
          members: data.member,
          tier: data.current_level,
        },
      },
      req: req,
    });

    return true;
  };
  sequelizePaginate.paginate(MembershipTier);
  return MembershipTier;
};
