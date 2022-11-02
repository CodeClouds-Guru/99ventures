'use strict';
const {
  Model
} = require('sequelize');
const sequelizePaginate = require('sequelize-paginate')
const Joi = require('joi')
module.exports = (sequelize, DataTypes) => {
  class Layout extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Layout.init({
    company_portal_id: DataTypes.BIGINT,
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    html: DataTypes.TEXT('long'),
    layout_json: DataTypes.JSON,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
  }, {
    sequelize,
    modelName: 'Layout',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at", // alias createdAt as created_date
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "layouts",
  });
  Layout.fields = {
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
    company_portal_id: {
      field_name: 'company_portal_id',
      db_name: 'company_portal_id',
      type: 'text',
      placeholder: 'Company portal id',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    name: {
      field_name: 'name',
      db_name: 'name',
      type: 'text',
      placeholder: 'Name',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    code: {
      field_name: 'code',
      db_name: 'code',
      type: 'text',
      placeholder: 'Code',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    html: {
      field_name: 'html',
      db_name: 'html',
      type: 'text',
      placeholder: 'HTML',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    layout_json: {
      field_name: 'layout_json',
      db_name: 'layout_json',
      type: 'text',
      placeholder: 'JSON',
      listing: false,
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
      placeholder: 'Created at',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    }
  }
  //validation function
  Layout.validate = function (req) {
    const schema = Joi.object({
      name: Joi.string().required().label('Name'),
      code: Joi.string().required().label('Code'),
      company_portal_id: Joi.required().label('Company portal'),
      html: Joi.string().required().label('HTML'),
      layout_json: Joi.object().required().label('JSON'),
    })
    return schema.validate(req.body)
  }
  sequelizePaginate.paginate(Layout)
  return Layout;
};