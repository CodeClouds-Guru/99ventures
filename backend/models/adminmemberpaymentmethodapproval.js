'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdminMemberPaymentMethodApproval extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AdminMemberPaymentMethodApproval.init(
    {
      member_id: DataTypes.BIGINT,
      payment_method_id: DataTypes.BIGINT,
      is_used: DataTypes.TINYINT,
      status: DataTypes.ENUM('approved', 'pending', 'rejected', 'expired'),
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: 'AdminMemberPaymentMethodApproval',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'admin_member_payment_method_approvals',
    }
  );
  //insert For Admin Approval for different payment method use
  AdminMemberPaymentMethodApproval.insertPaymentMethodForAdminApproval = async (
    data
  ) => {
    console.log(data);
    let checkAlreadyApproved = await AdminMemberPaymentMethodApproval.findOne({
      where: {
        member_id: data.member_id,
        is_used: 0,
        status: 'approved',
      },
      order: [['created_at', 'desc']],
    });
    if (!checkAlreadyApproved) {
      let insert_data = {
        member_id: data.member_id,
        payment_method_id: data.payment_method_id,
        created_by: data.member_id,
        status: 'approved',
      };

      return await AdminMemberPaymentMethodApproval.create(insert_data, {
        silent: true,
      });
    } else {
      return false;
    }
  };
  //insert For Admin Approval for different payment method use
  AdminMemberPaymentMethodApproval.updateAdminApprovalStatus = async (data) => {
    // console.log(data);
    let update_data = {
      updated_by: data.user_id,
      status: data.status,
    };

    return await AdminMemberPaymentMethodApproval.update(update_data, {
      where: { id: data.id },
    });
  };
  return AdminMemberPaymentMethodApproval;
};
