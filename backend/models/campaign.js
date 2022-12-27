'use strict';
const {
  Model
} = require('sequelize');
const sequelizePaginate = require('sequelize-paginate')
module.exports = (sequelize, DataTypes) => {
  class Campaign extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Campaign.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    affiliate_network: DataTypes.STRING,
    payout_amount: DataTypes.FLOAT,
    trigger_postback: DataTypes.STRING,
    postback_url: DataTypes.STRING,
    track_id: DataTypes.STRING,
    condition_type: DataTypes.STRING,
    condition_currency: DataTypes.STRING,
    condition_amount: DataTypes.FLOAT,
    status: DataTypes.STRING,
    created_at: DataTypes.TIME,
    updated_at: DataTypes.TIME,
    deleted_at: DataTypes.TIME,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'Campaign',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as 
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'campaigns',
  });

  Campaign.fields = {
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
      show_in_form: false,
      sort: false,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    description: {
      field_name: 'description',
      db_name: 'description',
      type: 'text',
      placeholder: 'Description',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    affiliate_network: {
      field_name: 'affiliate_network',
      db_name: 'affiliate_network',
      type: 'text',
      placeholder: 'Affiliate Network',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    payout_amount: {
      field_name: 'payout_amount',
      db_name: 'payout_amount',
      type: 'text',
      placeholder: 'Payout Amount',
      listing: true,
      show_in_form: true,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
    trigger_postback: {
      field_name: 'trigger_postback',
      db_name: 'trigger_postback',
      type: 'text',
      placeholder: 'Trigger Postback',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    postback_url: {
      field_name: 'postback_url',
      db_name: 'postback_url',
      type: 'text',
      placeholder: 'Postback URL',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    track_id: {
      field_name: 'track_id',
      db_name: 'track_id',
      type: 'text',
      placeholder: 'track_id',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    condition_type: {
      field_name: 'condition_type',
      db_name: 'condition_type',
      type: 'text',
      placeholder: 'Condition Type',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    condition_currency: {
      field_name: 'condition_currency',
      db_name: 'condition_currency',
      type: 'text',
      placeholder: 'Condition Currency',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    condition_amount: {
      field_name: 'condition_amount',
      db_name: 'condition_amount',
      type: 'text',
      placeholder: 'Condition Amount',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },status: {
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
      searchable: true,
    },
  }
  sequelizePaginate.paginate(Campaign)
  return Campaign
};