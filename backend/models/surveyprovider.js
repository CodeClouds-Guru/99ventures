'use strict';
const {
  Model
} = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const Joi = require('joi')

module.exports = (sequelize, DataTypes) => {
  class SurveyProvider extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SurveyProvider.init({
    name: DataTypes.STRING,
    logo: DataTypes.STRING,
    status: DataTypes.STRING,
    currency_percent: DataTypes.FLOAT,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: 'TIMESTAMP',
    updated_at: 'TIMESTAMP',
    deleted_at: 'TIMESTAMP',
    white_logo: {
      type: DataTypes.VIRTUAL,
      get() {
        let logo = this.logo || null;
        if (logo) {
          let url = logo.substring(0, logo.lastIndexOf("/") + 1);
          logo = logo.replace(url, 'white');
          return url + logo;
        } else {
          return '';
        }
      },
      set(value) {
        throw new Error('Do not try to set the `white_logo` value!');
      }
    },
  }, {
    sequelize,
    modelName: 'SurveyProvider',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'survey_providers',
  });
  SurveyProvider.fields = {
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
      placeholder: 'Logo URL',
      listing: false,
      show_in_form: true,
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
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    currency_percent: {
      field_name: 'currency_percent',
      db_name: 'currency_percent',
      type: 'number',
      placeholder: 'Currency Percent',
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
      required: true,
      value: '',
      width: '50',
      searchable: true,
    }
  };
  SurveyProvider.validate = function (req) {
    const schema = Joi.object({
      name: Joi.string().required().label('Name'),
      currency_percent: Joi.required().label('Currency percent')
    })
    return schema.validate(req.body)
  }
  sequelizePaginate.paginate(SurveyProvider);
  return SurveyProvider;
};