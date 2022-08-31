"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PaymentMethod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PaymentMethod.hasMany(models.PaymentMethodCredential, {
        foreignKey: 'payment_method_id',
        as: "credentials",
      })
    }
  }
  PaymentMethod.init(
    {
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "PaymentMethod",
      timestamps: false,
      paranoid: true,
      tableName: "payment_methods",
    }
  );
  return PaymentMethod;
};
