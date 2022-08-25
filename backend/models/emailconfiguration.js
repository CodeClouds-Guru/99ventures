'use strict'
const { Model } = require('sequelize')
const Joi = require('joi')

module.exports = (sequelize, DataTypes) => {
  class EmailConfiguration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmailConfiguration.validate = function (req) {
    const schema = Joi.object({
      from_name: Joi.string().required().label('From Name'),
      from_email: Joi.string().required().label('From Email'),
      email_username: Joi.string().required().label('Email Username'),
      email_server_host: Joi.string().required().label('Server Host'),
      email_server_port: Joi.required().label('Server Port'),
      ssl_required: Joi.required().label('SSL'),
      site_name_visible: Joi.required().label('Site Name Visible'),
      site_name_text: Joi.string().required().label('Site Name').optional(),
      password: Joi.string().allow('').required().label('Password').optional(),
      company_portal_id: Joi.required(),
    })
    return schema.validate(req.body)
  }
  EmailConfiguration.init(
    {
      from_name: DataTypes.STRING,
      from_email: DataTypes.STRING,
      email_username: DataTypes.STRING,
      email_server_host: DataTypes.STRING,
      email_server_port: DataTypes.STRING,
      ssl_required: DataTypes.INTEGER,
      site_name_visible: DataTypes.INTEGER,
      site_name_text: DataTypes.STRING,
      password: DataTypes.STRING,
      company_portal_id: DataTypes.BIGINT,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'EmailConfiguration',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'email_configurations',
    }
  )
  return EmailConfiguration
}
