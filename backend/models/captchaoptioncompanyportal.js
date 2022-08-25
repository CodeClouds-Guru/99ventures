"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CaptchaOptionCompanyPortal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CaptchaOptionCompanyPortal.init(
    {
      company_portal_id: DataTypes.BIGINT,
      captcha_option_id: DataTypes.BIGINT,
      created_at: "TIMESTAMP",
      updated_at: "TIMESTAMP",
      deleted_at: "TIMESTAMP",
    },
    {
      sequelize,
      modelName: "CaptchaOptionCompanyPortal",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at", // alias createdAt as created_date
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "captcha_option_company_portal",
    }
  );
  return CaptchaOptionCompanyPortal;
};
