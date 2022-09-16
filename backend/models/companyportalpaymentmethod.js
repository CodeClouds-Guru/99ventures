'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CompanyPortalPaymentMethod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CompanyPortalPaymentMethod.init({
    payment_method_id: DataTypes.BIGINT,
    company_portal_id: DataTypes.BIGINT,
    status: DataTypes.STRING,
    access_token: DataTypes.STRING,
    secret: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: 'TIMESTAMP',
    updated_at: 'TIMESTAMP',
    deleted_at: 'TIMESTAMP'
  }, {
    sequelize,
    modelName: 'CompanyPortalPaymentMethod',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'company_portal_payment_methods',
  });
  return CompanyPortalPaymentMethod;
};