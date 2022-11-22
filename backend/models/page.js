'use strict';
const {
  Model
} = require('sequelize');
const sequelizePaginate = require('sequelize-paginate')
const Joi = require('joi')
module.exports = (sequelize, DataTypes) => {
  class Page extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Page.belongsTo(models.Layout, {
        foreignKey: 'layout_id'
      })
    }
  }
  Page.init({
    company_portal_id: DataTypes.BIGINT,
    layout_id: DataTypes.BIGINT,
    html: DataTypes.TEXT,
    status: DataTypes.STRING,
    permalink: DataTypes.STRING,
    is_homepage: DataTypes.TINYINT,
    slug: DataTypes.STRING,
    name: DataTypes.STRING,
    page_json: DataTypes.JSON,
    meta_code: DataTypes.TEXT,
    keywords: DataTypes.STRING,
    descriptions: DataTypes.TEXT,
    auth_required: DataTypes.TINYINT,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: 'TIMESTAMP',
    updated_at: 'TIMESTAMP',
    deleted_at: 'TIMESTAMP'
  }, {
    sequelize,
    modelName: 'Page',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'pages',
  });
  Page.validate = function (req) {
    const schema = Joi.object({
      name: Joi.string().required().label('Name'),
      slug: Joi.string().required().label('Slug'),
      permalink: Joi.string().required().label('permalink'),
      company_portal_id: Joi.required().label('Company portal'),
      html: Joi.string().required().label('HTML'),
      page_json: Joi.object().required().label('JSON'),
      status: Joi.string().required().label('status'),
      keywords: Joi.optional().allow('').label('Keywords'),
      descriptions: Joi.optional().allow('').label('Descriptions'),
      meta_code: Joi.optional().allow('').label('Meta Code'),
      layout_id: Joi.required().label('Layout ID'),
      auth_required: Joi.optional().allow('').label('Auth required'),
    })
    return schema.validate(req.body)
  }
  //Page.extra_fields = ['layout'];
  Page.fields = {
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
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    layout_id: {
      field_name: 'layout_id',
      db_name: 'layout_id',
      type: 'text',
      placeholder: 'Layout id',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
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
    slug: {
      field_name: 'slug',
      db_name: 'slug',
      type: 'text',
      placeholder: 'Slug',
      listing: true,
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
      searchable: false,
    },
    page_json: {
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
      searchable: false,
    },
    auth_required: {
      field_name: 'auth_required',
      db_name: 'auth_required',
      type: 'text',
      placeholder: 'Auth Required',
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
    updated_at: {
      field_name: 'updated_at',
      db_name: 'updated_at',
      type: 'text',
      placeholder: 'Updated at',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    }
  }
  sequelizePaginate.paginate(Page)
  return Page;
};