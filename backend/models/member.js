'use strict';
const { Model, Op } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const Joi = require('joi');
const { MemberBalance } = require('../models');

const moment = require('moment');
// const {MemberNote} = require("../models/index");
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Member.hasMany(models.MemberNote, {
        foreignKey: 'member_id',
      });
      Member.hasMany(models.IpLog, {
        foreignKey: 'member_id',
      });
      Member.belongsTo(models.MembershipTier, {
        foreignKey: 'membership_tier_id',
      });
      Member.belongsTo(models.Country, {
        foreignKey: 'country_id',
      });
      Member.hasMany(models.MemberTransaction, {
        foreignKey: 'member_id',
      });
      Member.hasMany(models.MemberPaymentInformation, {
        foreignKey: 'member_id',
      });
      Member.belongsTo(models.MemberReferral, {
        foreignKey: 'member_referral_id',
      });
      Member.hasMany(models.MemberBalance, {
        foreignKey: 'member_id',
        as: 'member_amounts',
      });
      Member.hasMany(models.MemberReferral, {
        foreignKey: 'referral_id',
      });
      Member.belongsTo(models.CompanyPortal, {
        foreignKey: 'company_portal_id',
      });
      Member.belongsToMany(models.Survey, {
        through: 'member_surveys',
        timestamps: false,
        foreignKey: 'member_id',
        otherKey: 'survey_id',
      });
      Member.hasMany(models.CampaignMember, {
        foreignKey: 'member_id',
      });
      Member.belongsToMany(models.EmailAlert, {
        as: 'MemberEmailAlerts',
        through: 'email_alert_member',
        foreignKey: 'member_id',
        otherKey: 'email_alert_id',
        timestamps: false,
      });
    }
  }
  Member.validate = function (req) {
    const schema = Joi.object({
      first_name: Joi.string().required().label('First Name'),
      last_name: Joi.string().required().label('Last Name'),
      gender: Joi.string().required().label('Gender'),
      status: Joi.string().optional().label('Status'),
      username: Joi.string().min(3).max(30).required().label('Username'),
      email: Joi.string().optional(),
      company_portal_id: Joi.string().optional(),
      company_id: Joi.string().optional(),
      password: Joi.string().optional(),
      dob: Joi.string().optional(),
      phone_no: Joi.string().optional().label('Phone No'),
      country_id: Joi.optional().label('Country'),
      membership_tier_id: Joi.optional().label('Level'),
      address_1: Joi.string().allow('').required().label('Address 1'),
      address_2: Joi.string().allow('').optional().label('Address 2'),
      address_3: Joi.string().allow('').optional().label('Address 3'),
      zip_code: Joi.string().allow('').optional().label('Zip Code'),
      avatar: Joi.optional().label('Avatar'),
      country_code: Joi.optional().label('Country Code'),
    });
    return schema.validate(req.body);
  };

  Member.init(
    {
      company_portal_id: DataTypes.BIGINT,
      company_id: DataTypes.BIGINT,
      membership_tier_id: DataTypes.BIGINT,
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      username: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: 'Username already in use!',
        },
      },
      email: DataTypes.STRING,
      status: DataTypes.STRING,
      phone_no: DataTypes.STRING,
      country_code: {
        type: DataTypes.INTEGER,
        set(value) {
          if (value == '' || value == null)
            this.setDataValue('country_code', null);
          else this.setDataValue('country_code', value);
        },
      },
      dob: {
        type: DataTypes.DATE,
        get() {
          if (this.getDataValue('dob'))
            return moment(this.getDataValue('dob')).format('YYYY-MM-DD');
        },
      },
      member_referral_id: DataTypes.BIGINT,
      password: DataTypes.STRING,
      last_active_on: 'TIMESTAMP',
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
      avatar: {
        type: DataTypes.STRING,
        get() {
          let rawValue = this.getDataValue('avatar') || null;
          if (!rawValue || rawValue === '') {
            const publicURL =
              process.env.CLIENT_API_PUBLIC_URL || 'http://127.0.0.1:4000';
            rawValue = `${publicURL}/images/demo-user.png`;
          } else {
            rawValue = process.env.S3_BUCKET_OBJECT_URL + rawValue;
          }
          return rawValue;
        },
        set(value) {
          if (value == '' || value == null) this.setDataValue('avatar', null);
          else this.setDataValue('avatar', value);
        },
      },
      referral_code: DataTypes.STRING,
      address_1: DataTypes.STRING,
      address_2: DataTypes.STRING,
      address_3: DataTypes.STRING,
      zip_code: DataTypes.STRING,
      country_id: {
        type: DataTypes.INTEGER,
        set(value) {
          if (value == '' || value == null)
            this.setDataValue('country_id', null);
          else this.setDataValue('country_id', value);
        },
      },
      gender: DataTypes.ENUM('male', 'female', 'other'),
      name: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.first_name} ${this.last_name}`;
        }
      }
    },
    {
      sequelize,
      modelName: 'Member',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'members',
      hooks: {
        afterCreate: async (member, options) => {
          //member balance
          await sequelize.models.MemberBalance.bulkCreate([
            {
              member_id: member.id,
              amount: 0.0,
              amount_type: 'cash',
              created_by: '0',
            },
            {
              member_id: member.id,
              amount: 0.0,
              amount_type: 'point',
              created_by: '0',
            },
          ]);
          //member referral code
          await sequelize.models.Member.update(
            { referral_code: member.id + '0' + new Date().getTime() },
            {
              where: { id: member.id },
            }
          );
        },
      },
    }
  );

  Member.extra_fields = ['company_portal_id', 'ip'];
  Member.fields = {
    username: {
      field_name: 'username',
      db_name: 'username',
      type: 'text',
      placeholder: 'Username',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    id: {
      field_name: 'id',
      db_name: 'id',
      type: 'text',
      placeholder: 'Id',
      listing: true,
      show_in_form: false,
      sort: true,
      required: false,
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
      show_in_form: false,
      sort: false,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
    ip: {
      field_name: 'ip',
      db_name: 'ip',
      type: 'text',
      placeholder: 'IP',
      listing: true,
      show_in_form: false,
      sort: false,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
    first_name: {
      field_name: 'first_name',
      db_name: 'first_name',
      type: 'text',
      placeholder: 'First Name',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    last_name: {
      field_name: 'last_name',
      db_name: 'last_name',
      type: 'text',
      placeholder: 'Last Name',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    email: {
      field_name: 'email',
      db_name: 'email',
      type: 'text',
      placeholder: 'Email',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    company_portal_id: {
      field_name: 'company_portal_id',
      db_name: 'company_portal_id',
      type: 'text',
      placeholder: 'Company Portal',
      listing: true,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
    gender: {
      field_name: 'gender',
      db_name: 'gender',
      type: 'text',
      placeholder: 'Gender',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    phone_no: {
      field_name: 'phone_no',
      db_name: 'phone_no',
      type: 'text',
      placeholder: 'Phone No',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    created_at: {
      field_name: 'created_at',
      db_name: 'created_at',
      type: 'text',
      placeholder: 'Created at',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
  };

  sequelizePaginate.paginate(Member);

  Member.changeStatus = async (req) => {
    const { MemberNote } = require('../models/index');

    const value = req.body.value || '';
    const field_name = req.body.field_name || '';
    const id = req.params.id || null;
    const notes = req.body.member_notes || null;
    const member_ids = id
      ? [id]
      : Array.isArray(req.body.member_id)
        ? req.body.member_id
        : [req.body.member_id];
    try {
      let members = await Member.findAll({
        attributes: ['status', 'id'],
        where: {
          id: {
            [Op.in]: member_ids,
          },
        },
      });
      let result = await Member.update(
        {
          [field_name]: value,
        },
        {
          where: {
            id: {
              [Op.in]: member_ids,
            },
          },
          return: true,
        }
      );
      if (notes) {
        let data = [];
        members.forEach((element) => {
          data.push({
            user_id: req.user.id,
            member_id: element.dataValues.id,
            previous_status: element.dataValues.status,
            current_status: value,
            note: notes,
          });
        });
        if (data.length > 0) await MemberNote.bulkCreate(data);
      }
      return result[0];
    } catch (error) {
      console.error(error);
      // this.throwCustomError("Unable to save data", 500);
    }
  };
  return Member;
};
