'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MemberPaymentInformation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MemberPaymentInformation.hasOne(models.PaymentMethod, {
        foreignKey: "payment_method_id",
      });
    }
  }
  MemberPaymentInformation.init({
    member_id: DataTypes.BIGINT,
    payment_method_id: DataTypes.BIGINT,
    name: DataTypes.STRING,
    value: DataTypes.STRING,
    status: DataTypes.TINYINT,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: "TIMESTAMP",
    updated_at: "TIMESTAMP",
    deleted_at: "TIMESTAMP",
  }, {
    sequelize,
    modelName: 'MemberPaymentInformation',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at", // alias createdAt as created_date
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "member_payment_informations",
  });
  return MemberPaymentInformation;
};