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
      // define association here
    }
  }
  Page.init({
    company_portal_id: DataTypes.BIGINT,
    layout_id: DataTypes.BIGINT,
    html: DataTypes.TEXT,
    status: DataTypes.STRING,
    parmalink: DataTypes.STRING,
    is_homepage: DataTypes.TINYINT,
    slug: DataTypes.STRING,
    name: DataTypes.STRING,
    page_json: DataTypes.JSON,
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
      parmalink: Joi.string().required().label('parmalink'),
      company_portal_id: Joi.required().label('Company portal'),
      html: Joi.string().required().label('HTML'),
      page_json: Joi.object().required().label('JSON'),
      status: Joi.string().required().label('status'),
      is_homepage: Joi.required().label('Home Page'),
      layout_id: Joi.required().label('Layout ID')
    })
    return schema.validate(req.body)
  }
  Page.extra_fields = ['layout'];
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
      searchable: true,
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
      searchable: true,
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
      searchable: true,
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