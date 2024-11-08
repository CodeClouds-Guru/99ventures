'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MemberBalance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MemberBalance.init({
    member_id: DataTypes.BIGINT,
    // type: DataTypes.ENUM('admin_adjustment', 'survey', 'referral'),
    amount: DataTypes.DECIMAL,
    amount_type: DataTypes.ENUM('cash', 'point'),
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: "TIMESTAMP",
    updated_at: "TIMESTAMP",
    deleted_at: "TIMESTAMP",
  }, {
    sequelize,
    modelName: 'MemberBalance',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at", // alias createdAt as created_date
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "member_balances",
  });
  return MemberBalance;
};