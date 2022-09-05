"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PaymentMethodCredential extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PaymentMethodCredential.init(
    {
      payment_method_id: DataTypes.BIGINT,
      company_portal_id: DataTypes.BIGINT,
      slug: DataTypes.STRING,
      name: DataTypes.STRING,
      value: {
        type: DataTypes.STRING,
        get() {
          return this.getDataValue("value") || "";
        },
      },
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: "TIMESTAMP",
      updated_at: "TIMESTAMP",
      deleted_at: "TIMESTAMP",
    },
    {
      sequelize,
      modelName: "PaymentMethodCredential",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at", // alias createdAt as created_date
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "payment_method_credentials",
    }
  );
  return PaymentMethodCredential;
};
