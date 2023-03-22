'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WithdrawalRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  WithdrawalRequest.init(
    {
      member_id: DataTypes.BIGINT,
      member_transaction_id: DataTypes.BIGINT,
      amount: DataTypes.FLOAT,
      amount_type: DataTypes.ENUM('cash', 'point'),
      currency: DataTypes.STRING,
      withdrawal_type_id: DataTypes.BIGINT,
      requested_on: 'TIMESTAMP',
      status: DataTypes.ENUM('approved', 'pending', 'rejected', 'expired'),
      transaction_time: DataTypes.TIME,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      transaction_made_by: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: 'WithdrawalRequest',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      tableName: 'withdrawal_requests',
    }
  );
  return WithdrawalRequest;
};
