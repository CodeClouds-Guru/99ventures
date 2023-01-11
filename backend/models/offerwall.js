'use strict';
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const Joi = require('joi');
module.exports = (sequelize, DataTypes) => {
  class OfferWall extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OfferWall.belongsTo(models.Campaign, {
        foreignKey: 'campaign_id',
      });
      OfferWall.belongsTo(models.CompanyPortal, {
        foreignKey: 'company_portal_id',
      });
    }
  }
  OfferWall.init(
    {
      company_portal_id: DataTypes.BIGINT,
      campaign_id: DataTypes.BIGINT,
      premium_configuration: DataTypes.ENUM('Custom', 'Premium'),
      name: DataTypes.STRING,
      sub_id_prefix: DataTypes.STRING,
      log_postback_erros: DataTypes.INTEGER,
      secure_sub_ids: DataTypes.INTEGER,
      status: DataTypes.ENUM('Enabled', 'Disabled'),
      mode: DataTypes.ENUM('Reward Tool', 'PostBack'),
      allow_from_any_ip: DataTypes.INTEGER,
      campaign_id_variable: DataTypes.STRING,
      campaign_name_variable: DataTypes.STRING,
      sub_id_variable: DataTypes.STRING,
      reverse_variable: DataTypes.STRING,
      reverse_value: DataTypes.STRING,
      response_ok: DataTypes.STRING,
      response_fail: DataTypes.STRING,
      currency_variable: DataTypes.STRING,
      currency_options: DataTypes.ENUM('Cash', 'Points'),
      currency_percent: DataTypes.STRING,
      currency_max: DataTypes.STRING,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'OfferWall',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'offer_walls',
    }
  );
  OfferWall.extra_fields = ['Campaign.name'];
  OfferWall.fields = {
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
      searchable: false,
    },
    company_portal_id: {
      field_name: 'company_portal_id',
      db_name: 'company_portal_id',
      type: 'text',
      placeholder: 'Company Portal ID',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    campaign_id: {
      field_name: 'campaign_id',
      db_name: 'campaign_id',
      type: 'text',
      placeholder: 'Campaign ID',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    premium_configuration: {
      field_name: 'premium_configuration',
      db_name: 'premium_configuration',
      type: 'text',
      placeholder: 'Premium Configuration',
      listing: false,
      show_in_form: true,
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
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    sub_id_prefix: {
      field_name: 'sub_id_prefix',
      db_name: 'sub_id_prefix',
      type: 'text',
      placeholder: 'Sub ID Prefix',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    log_postback_erros: {
      field_name: 'log_postback_erros',
      db_name: 'log_postback_erros',
      type: 'text',
      placeholder: 'Log Postback Erros',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    secure_sub_ids: {
      field_name: 'secure_sub_ids',
      db_name: 'secure_sub_ids',
      type: 'text',
      placeholder: 'Secure Sub Ids',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
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
    mode: {
      field_name: 'mode',
      db_name: 'mode',
      type: 'text',
      placeholder: 'Mode',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    allow_from_any_ip: {
      field_name: 'allow_from_any_ip',
      db_name: 'allow_from_any_ip',
      type: 'text',
      placeholder: 'Allow From Any IP',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    campaign_id_variable: {
      field_name: 'campaign_id_variable',
      db_name: 'campaign_id_variable',
      type: 'text',
      placeholder: 'Campaign ID Variable',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    campaign_name_variable: {
      field_name: 'campaign_name_variable',
      db_name: 'campaign_name_variable',
      type: 'text',
      placeholder: 'Campaign Name Variable',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    sub_id_variable: {
      field_name: 'sub_id_variable',
      db_name: 'sub_id_variable',
      type: 'text',
      placeholder: 'Sub ID Variable',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    sub_id_variable: {
      field_name: 'sub_id_variable',
      db_name: 'sub_id_variable',
      type: 'text',
      placeholder: 'Sub ID Variable',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    reverse_variable: {
      field_name: 'reverse_variable',
      db_name: 'reverse_variable',
      type: 'text',
      placeholder: 'Reverse Variable',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    reverse_value: {
      field_name: 'reverse_value',
      db_name: 'reverse_value',
      type: 'text',
      placeholder: 'Reverse Value',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    response_ok: {
      field_name: 'response_ok',
      db_name: 'response_ok',
      type: 'text',
      placeholder: 'Response Ok',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    response_fail: {
      field_name: 'response_fail',
      db_name: 'response_fail',
      type: 'text',
      placeholder: 'Response Fail',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    currency_variable: {
      field_name: 'currency_variable',
      db_name: 'currency_variable',
      type: 'text',
      placeholder: 'Currency Variable',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    currency_options: {
      field_name: 'currency_options',
      db_name: 'currency_options',
      type: 'text',
      placeholder: 'Currency Options',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    currency_percent: {
      field_name: 'currency_percent',
      db_name: 'currency_percent',
      type: 'text',
      placeholder: 'Currency Percent',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    currency_max: {
      field_name: 'currency_max',
      db_name: 'currency_max',
      type: 'text',
      placeholder: 'Currency Max',
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
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    '$Campaign.name$': {
      field_name: 'campaign_name',
      db_name: 'name',
      type: 'text',
      placeholder: 'Campaign',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
  };
  OfferWall.validate = function (req) {
    const schema = Joi.object({
      campaign_id: Joi.required().label('campaign_id'),
      premium_configuration: Joi.string()
        .required()
        .label('premium_configuration'),
      name: Joi.string().required().label('name'),
      sub_id_prefix: Joi.required().label('sub_id_prefix'),
      log_postback_erros: Joi.string().required().label('log_postback_erros'),
      secure_sub_ids: Joi.required().label('secure_sub_ids'),
      status: Joi.string().required().label('status'),
      mode: Joi.required().label('mode'),
      allow_from_any_ip: Joi.required().label('allow_from_any_ip'),
      ips: Joi.optional().allow('').label('ips'),
      campaign_id_variable: Joi.required().label('campaign_id_variable'),
      campaign_name_variable: Joi.required().label('campaign_name_variable'),
      sub_id_variable: Joi.required().label('sub_id_variable'),
      reverse_variable: Joi.required().label('reverse_variable'),
      reverse_value: Joi.optional().allow('').label('reverse_value'),
      response_ok: Joi.required().label('response_ok'),
      response_fail: Joi.required().label('response_fail'),
      currency_options: Joi.required().label('currency_options'),
      currency_percent: Joi.required().label('currency_percent'),
      currency_variable: Joi.required().label('currency_variable'),
      currency_max: Joi.required().label('currency_max'),
    });
    return schema.validate(req.body);
  };
  sequelizePaginate.paginate(OfferWall);
  return OfferWall;
};
