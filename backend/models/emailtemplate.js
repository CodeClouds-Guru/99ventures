'use strict';
const {
  Model
} = require('sequelize');
const Joi = require('joi')
module.exports = (sequelize, DataTypes) => {
  class EmailTemplate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      EmailTemplate.belongsToMany(models.EmailAction, {
        through: 'email_action_email_template',
        foreignKey: 'email_template_id',
        otherKey: 'email_action_id',
        timestamps: false,
      })
    }
  }
  EmailTemplate.init({
    subject: DataTypes.STRING,
    body: DataTypes.TEXT('long'),
    body_json:DataTypes.JSON,
    company_portal_id: DataTypes.BIGINT,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: 'TIMESTAMP',
    updated_at: 'TIMESTAMP',
    deleted_at: 'TIMESTAMP'
  }, {
    sequelize,
    modelName: 'EmailTemplate',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'email_templates',
  });
  //validation function
  EmailTemplate.validate = function (req) {
              const schema = Joi.object({
                subject: Joi.string().required().label('Subject'),
                body: Joi.string().required().label('Body'),
                body_json: Joi.required().label('Body JSON'),
                email_actions: Joi.optional().allow('').label('Email Action'),
                company_portal_id: Joi.required().label('Company portal'),
              })
              return schema.validate(req.body)
  }
  //declare fields
  EmailTemplate.extra_fields = ['email_actions','email_template_variables'];
  EmailTemplate.fields = {
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
    subject: {
      field_name: 'subject',
      db_name: 'subject',
      type: 'text',
      placeholder: 'Subject',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    body: {
      field_name: 'body',
      db_name: 'body',
      type: 'text',
      placeholder: 'Body',
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
    email_actions: {
      field_name: 'email_actions',
      db_name: 'email_actions',
      type: 'select',
      placeholder: 'Action',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
      options: [],
    },
    email_template_variables: {
      field_name: 'email_template_variables',
      db_name: 'email_template_variables',
      type: 'select',
      placeholder: 'Variables',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
      options: [],
    },
  }
  return EmailTemplate;
};