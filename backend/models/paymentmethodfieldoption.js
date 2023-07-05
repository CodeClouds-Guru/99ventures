'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentMethodFieldOption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PaymentMethodFieldOption.init(
    {
      field_name: DataTypes.STRING,
      field_type: DataTypes.STRING,
      payment_method_id: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: 'PaymentMethodFieldOption',
      timestamps: false,
      paranoid: false,
      tableName: 'payment_method_field_options',
    }
  );
  return PaymentMethodFieldOption;
};
