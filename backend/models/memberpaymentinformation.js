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
    // console.log(data);

    var info = data.member_payment_info.map((info) => {
      return info.field_name;
    });
    // console.log('--------info', info);

    await MemberPaymentInformation.update(
      {
        status: 0,
      },
      {
        where: {
          member_id: data.member_id,
          name: info,
        },
      }
    );
    let payment_methods = await PaymentMethod.findAll({
      where: { status: [1, '1'] },
      attributes: ['id'],
    });

    var member_payment_information = [];
    for (const methods of payment_methods) {
      for (const option of data.member_payment_info) {
        member_payment_information.push({
          member_id: data.member_id,
          payment_method_id: methods.id,
          name: option.field_name,
          value: option.field_value,
          created_by: data.member_id,
          status: 1,
        });
      }
    }
    // payment_methods = payment_methods.map((methods) => {
    //   return {
    //     member_id: data.member_id,
    //     payment_method_id: methods.id,
    //     name: data.payment_field_option,
    //     value: data.payment_email,
    //     created_by: data.member_id,
    //     status: 1,
    //   };
    // });
    // console.log('member_payment_information', member_payment_information);
    if (member_payment_information.length > 0) {
      await MemberPaymentInformation.bulkCreate(member_payment_information);
    }
    return true;
  };
  return MemberPaymentInformation;
};
