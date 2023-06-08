'use strict';
const { Model } = require('sequelize');
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
        as: 'credentials',
      });
      PaymentMethod.hasMany(models.MemberPaymentInformation, {
        foreignKey: 'payment_method_id',
        // as: "credentials",
      });
      PaymentMethod.hasMany(models.WithdrawalType, {
        foreignKey: 'payment_method_id',
        as: 'withdrawal_types',
      });
    }
  }
  PaymentMethod.init(
    {
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      // logo: {
      //   type: DataTypes.STRING,
      //   get() {
      //     let rawValue = this.getDataValue('logo') || null;
      //     const publicURL =
      //       process.env.CLIENT_API_PUBLIC_URL || 'http://127.0.0.1:4000';
      //     rawValue = rawValue
      //       ? process.env.S3_BUCKET_OBJECT_URL + rawValue
      //       : '';
      //     return rawValue;
      //   },
      // },
      status: DataTypes.ENUM('0', '1'),
    },
    {
      sequelize,
      modelName: 'PaymentMethod',
      timestamps: false,
      paranoid: true,
      tableName: 'payment_methods',
    }
  );
  return PaymentMethod;
};
