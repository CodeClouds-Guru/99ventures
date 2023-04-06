'use strict';
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const Joi = require('joi');

module.exports = (sequelize, DataTypes) => {
  class Script extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Script.validate = function (req) {
    const schema = Joi.object({
      code: Joi.string().required().label('Code'),
      company_portal_id: Joi.required().label('Company portal'),
      name: Joi.string().required().label('Name'),
      script_html: Joi.string().required().label('Script HTML'),
      script_json: Joi.object().required().label('Script JSON'),
      status: Joi.optional(),
      module: Joi.optional().allow('').label('Code'),
      action_type: Joi.optional(),
      config_json: Joi.optional(),
    });
    return schema.validate(req.body);
  };

  Script.init(
    {
      code: DataTypes.STRING,
      company_portal_id: DataTypes.BIGINT,
      name: DataTypes.STRING,
      module: DataTypes.STRING,
      script_html: DataTypes.TEXT('long'),
      action_type: DataTypes.STRING,
      config_json: DataTypes.JSON,
      status: {
        type: DataTypes.TINYINT,
        // get() {
        //   return parseInt(this.getDataValue("status"));
        // },
      },
      script_json: DataTypes.JSON,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'Script',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'scripts',
    }
  );
  Script.fields = {
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
    code: {
      field_name: 'code',
      db_name: 'code',
      type: 'text',
      placeholder: 'Script ID',
      listing: true,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
    module: {
      field_name: 'module',
      db_name: 'module',
      type: 'text',
      placeholder: 'Module',
      listing: true,
      show_in_form: true,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
    action_type: {
      field_name: 'action_type',
      db_name: 'action_type',
      type: 'text',
      placeholder: 'Action Type',
      listing: false,
      show_in_form: true,
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
      placeholder: 'company_portal_id',
      listing: false,
      show_in_form: false,
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
    script_html: {
      field_name: 'script_html',
      db_name: 'script_html',
      type: 'text',
      placeholder: 'Script',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    script_json: {
      field_name: 'script_json',
      db_name: 'script_json',
      type: 'JSON',
      placeholder: 'Script JSON',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      searchable: false,
    },
    status: {
      field_name: 'status',
      db_name: 'status',
      type: 'text',
      placeholder: 'Insets',
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
      placeholder: 'Created at',
      listing: false,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    config_json: {
      field_name: 'config_json',
      db_name: 'config_json',
      type: 'text',
      placeholder: 'Config Json',
      listing: false,
      show_in_form: false,
      sort: false,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
  };
  sequelizePaginate.paginate(Script);
  return Script;
};
