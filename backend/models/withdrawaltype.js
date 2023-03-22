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
    }
  }
  WithdrawalType.init(
    {
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'WithdrawalType',
      timestamps: true,
      paranoid: true,
      tableName: 'withdrawal_types',
    }
  );
  return WithdrawalType;
};
