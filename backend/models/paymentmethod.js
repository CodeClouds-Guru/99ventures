'use strict';
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const Joi = require('joi');
module.exports = (sequelize, DataTypes) => {
  class PaymentMethod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PaymentMethod.belongsToMany(models.Country, {
        as: 'allowed_countries',
        through: 'allowed_country_payment_method',
        foreignKey: 'payment_method_id',
        otherKey: 'country_id',
        timestamps: false,
      });
      PaymentMethod.hasMany(models.WithdrawalType, {
        foreignKey: 'payment_method_id',
        as: 'withdrawal_types',
      });
      PaymentMethod.belongsToMany(models.Member, {
        as: 'excluded_members',
        through: 'excluded_member_payment_method',
        foreignKey: 'payment_method_id',
        otherKey: 'member_id',
        timestamps: false,
      });
    }
  }
  PaymentMethod.init(
    {
      company_portal_id: DataTypes.BIGINT,
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      description: DataTypes.STRING,
      image_url: DataTypes.STRING,
      type_user_info_again: DataTypes.TINYINT,
      payment_field_options: DataTypes.STRING,
      minimum_amount: DataTypes.FLOAT,
      maximum_amount: DataTypes.FLOAT,
      fixed_amount: DataTypes.FLOAT,
      withdraw_redo_interval: DataTypes.FLOAT,
      status: DataTypes.TINYINT,
      same_account_options: DataTypes.STRING,
      past_withdrawal_options: DataTypes.STRING,
      past_withdrawal_count: DataTypes.INTEGER,
      verified_options: DataTypes.STRING,
      upgrade_options: DataTypes.STRING,
      fee_percent: DataTypes.FLOAT,
      api_username: DataTypes.STRING,
      api_password: DataTypes.STRING,
      api_signature: DataTypes.STRING,
      api_memo: DataTypes.STRING,
      payment_type: DataTypes.STRING,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: 'PaymentMethod',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'payment_methods',
    }
  );
  PaymentMethod.validate = function (req) {
    const schema = Joi.object({
      company_portal_id: Joi.required().label('Company portal'),
      name: Joi.string().required().label('Name'),
      slug: Joi.string().required().label('Slug'),
      description: Joi.optional().allow('').label('Description'),
      image_url: Joi.optional().allow('').label('Image Url'),
      type_user_info_again: Joi.optional()
        .allow('')
        .label('Type User Info Again'),
      payment_field_options: Joi.string()
        .required()
        .label('Payment Field Options'),
      minimum_amount: Joi.optional().allow('').label('Minimum Amount'),
      maximum_amount: Joi.optional().allow('').label('Maximum Amount'),
      fixed_amount: Joi.optional().allow('').label('Fixed Amount'),
      withdraw_redo_interval: Joi.optional()
        .allow(null)
        .label('Withdraw Redo Interval'),
      status: Joi.number().required().label('status'),
      same_account_options: Joi.optional()
        .allow('')
        .label('Same Account Options'),
      past_withdrawal_options: Joi.optional()
        .allow('')
        .label('Past Withdrawal Options'),
      past_withdrawal_count: Joi.optional()
        .allow('')
        .label('Past Withdrawal Count'),
      verified_options: Joi.optional().allow('').label('Verified Options'),
      upgrade_options: Joi.optional().allow('').label('Upgrade Options'),
      fee_percent: Joi.optional().allow('').label('Fee Percentage'),
      api_username: Joi.optional().allow('').label('Api Username'),
      api_password: Joi.optional().allow('').label('Api Password'),
      api_signature: Joi.optional().allow('').label('Api Signature'),
      api_memo: Joi.optional().allow('').label('Api Memo'),
      payment_type: Joi.string().required().label('Payment Type'),
      updated_at: Joi.optional().allow('').label('Updated At'),
    });
    return schema.validate(req.body);
  };

  PaymentMethod.fields = {
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
      searchable: false,
    },
    status: {
      field_name: 'status',
      db_name: 'status',
      type: 'text',
      placeholder: 'Status',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    created_at: {
      field_name: 'created_at',
      db_name: 'created_at',
      type: 'text',
      placeholder: 'Created At',
      listing: true,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
  };
  sequelizePaginate.paginate(PaymentMethod);
  return PaymentMethod;
};
