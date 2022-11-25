'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MemberTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MemberTransaction.init({
    member_payment_information_id: DataTypes.BIGINT,
    type: DataTypes.ENUM('credited', 'withdraw'),
    amount: DataTypes.DECIMAL(10, 2),
    balance: DataTypes.DECIMAL(10, 2),
    completed_at: "TIMESTAMP",
    transaction_id: DataTypes.STRING,
    status: DataTypes.TINYINT,
    note: DataTypes.STRING,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: "TIMESTAMP",
    updated_at: "TIMESTAMP",
    deleted_at: "TIMESTAMP",
  }, {
    sequelize,
    modelName: 'MemberTransaction',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at", // alias createdAt as created_date
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "member_transactions",
  });
  return MemberTransaction;
};