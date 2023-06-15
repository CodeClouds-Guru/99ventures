'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MemberPaymentInformation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MemberPaymentInformation.init(
    {
      member_id: DataTypes.BIGINT,
      payment_method_id: DataTypes.BIGINT,
      name: DataTypes.STRING,
      value: DataTypes.STRING,
      status: DataTypes.TINYINT,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'MemberPaymentInformation',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'member_payment_informations',
    }
  );
  MemberPaymentInformation.updatePaymentInformation = async (data) => {
    const { PaymentMethod } = require('../models/index');
    await MemberPaymentInformation.update(
      {
        status: 0,
      },
      {
        where: {
          member_id: data.member_id,
        },
      }
    );
    let payment_methods = await PaymentMethod.findAll({
      where: { status: [1, '1'] },
      attributes: ['id'],
    });
    payment_methods = payment_methods.map((methods) => {
      return {
        member_id: data.member_id,
        payment_method_id: methods.id,
        name: data.payment_field_option,
        value: data.payment_email,
        created_by: data.member_id,
        status: 1,
      };
    });
    console.log(payment_methods);
    if (payment_methods.length > 0) {
      await MemberPaymentInformation.bulkCreate(payment_methods);
    }
    return true;
  };
  return MemberPaymentInformation;
};
