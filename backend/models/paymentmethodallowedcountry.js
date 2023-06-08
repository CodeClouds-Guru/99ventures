'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentMethodAllowedCountry extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PaymentMethodAllowedCountry.belongsTo(models.PaymentMethod, {
        foreignKey: 'payment_method_id',
      });
      PaymentMethodAllowedCountry.belongsTo(models.Country, {
        foreignKey: 'country_id',
      });
    }
  }
  PaymentMethodAllowedCountry.init(
    {
      payment_method_id: DataTypes.BIGINT,
      country_id: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: 'PaymentMethodAllowedCountry',
      timestamps: false,
      paranoid: false,
      tableName: 'payment_methods_allowed_countries',
    }
  );
  return PaymentMethodAllowedCountry;
};
