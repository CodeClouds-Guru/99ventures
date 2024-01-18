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
          console.log(rawValue);
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
            console.log('check_url', check_url);
            if (!check_url)
              rawValue = process.env.S3_BUCKET_OBJECT_URL + rawValue;
          }
          const publicURL =
            process.env.CLIENT_API_PUBLIC_URL || 'http://127.0.0.1:4000';
          // console.log('imageRawValue', rawValue);
          return rawValue ? rawValue : `${publicURL}/images/no-img.jpg`;
        },
        set(value) {
          // console.log(value, value === 'null');
          if (value == '' || value == null || value === 'null')
            this.setDataValue('logo', null);
          else this.setDataValue('logo', value);
        },
      },
      status: DataTypes.STRING,
      reward_point: DataTypes.INTEGER,
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

  sequelizePaginate.paginate(MembershipTier);
  return MembershipTier;
};
