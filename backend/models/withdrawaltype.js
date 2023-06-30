'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WithdrawalType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      WithdrawalType.belongsTo(models.PaymentMethod, {
        foreignKey: 'payment_method_id',
      });
      WithdrawalType.hasMany(models.WithdrawalRequest, {
        foreignKey: 'withdrawal_type_id',
      });
    }
  }
  WithdrawalType.init(
    {
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      payment_method_id: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: 'WithdrawalType',
      tableName: 'withdrawal_types',
      timestamps: false,
    }
  );
  return WithdrawalType;
};
