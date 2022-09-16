'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CaptchaOption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CaptchaOption.belongsToMany(models.CompanyPortal, {
        through: 'captcha_option_company_portal',
        timestamps: false,
        foreignKey: 'captcha_option_id',
        otherKey: 'company_portal_id',
      })
    }
  }
  CaptchaOption.init({
    name: DataTypes.STRING,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: 'TIMESTAMP',
    updated_at: 'TIMESTAMP',
    deleted_at: 'TIMESTAMP'
  }, {
    sequelize,
    modelName: 'CaptchaOption',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'captcha_options',
  });
  return CaptchaOption;
};