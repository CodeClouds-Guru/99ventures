'use strict';
const {
  Model
} = require('sequelize');
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
  EmailConfiguration.init({
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
    deleted_at: 'TIMESTAMP'
  }, {
    sequelize,
    modelName: 'EmailConfiguration',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'email_configurations',
  });
  return EmailConfiguration;
};