'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentMethodExcludedMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PaymentMethodExcludedMember.belongsTo(models.PaymentMethod, {
        foreignKey: 'payment_method_id',
      });
      PaymentMethodExcludedMember.belongsTo(models.Member, {
        foreignKey: 'member_id',
      });
    }
  }
  PaymentMethodExcludedMember.init(
    {
      payment_method_id: DataTypes.BIGINT,
      member_id: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: 'PaymentMethodExcludedMember',
      timestamps: false,
      paranoid: false,
      tableName: 'payment_methods_excluded_members',
    }
  );
  return PaymentMethodExcludedMember;
};
