'use strict';
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
module.exports = (sequelize, DataTypes) => {
  class WithdrawalRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      WithdrawalRequest.belongsTo(models.Member, {
        foreignKey: 'member_id',
      });
      WithdrawalRequest.belongsTo(models.User, {
        foreignKey: 'transaction_made_by',
      });
      // WithdrawalRequest.hasOne(models.WithdrawalType, {
      //   foreignKey: 'id',
      // });
      WithdrawalRequest.belongsTo(models.PaymentMethod, {
        foreignKey: 'withdrawal_type_id',
      });
      WithdrawalRequest.belongsTo(models.MemberTransaction, {
        foreignKey: 'member_transaction_id',
      });
    }
  }
  WithdrawalRequest.init(
    {
      member_id: DataTypes.BIGINT,
      member_transaction_id: DataTypes.BIGINT,
      amount: DataTypes.DECIMAL(10, 2),
      amount_type: DataTypes.ENUM('cash', 'point'),
      currency: {
        type: DataTypes.STRING,
        get() {
          if (
            this.getDataValue('currency') === 'usd' ||
            this.getDataValue('currency') === 'USD'
          ) {
            return '$';
          } else {
            return this.getDataValue('currency');
          }
        },
      },
      amount_with_currency: {
        type: DataTypes.VIRTUAL,
        get() {
          const amount = this.getDataValue('amount');
          const currency = this.getDataValue('currency');
          if (['usd', 'USD', '$'].includes(currency) && amount) {
            return '$' + amount;
          } else {
            return amount;
          }
        },
      },
      withdrawal_type_id: DataTypes.BIGINT,
      requested_on: 'TIMESTAMP',
      status: DataTypes.ENUM('approved', 'pending', 'rejected', 'expired'),
      transaction_time: DataTypes.TIME,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      transaction_made_by: DataTypes.BIGINT,
      note: DataTypes.TEXT,
      payment_email: DataTypes.STRING,
      ip: DataTypes.STRING,
      warning: DataTypes.VIRTUAL,
    },
    {
      sequelize,
      modelName: 'WithdrawalRequest',
      timestamps: true,
      // paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      tableName: 'withdrawal_requests',
    }
  );
  WithdrawalRequest.extra_fields = [
    'Member.first_name',
    'User.alias_name',
    'Member.username',
  ];
  WithdrawalRequest.fields = {
    id: {
      field_name: 'id',
      db_name: 'id',
      type: 'text',
      placeholder: 'Id',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
    member_id: {
      field_name: 'member_id',
      db_name: 'member_id',
      type: 'text',
      placeholder: 'Member ID',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    payment_email: {
      field_name: 'payment_email',
      db_name: 'payment_email',
      type: 'text',
      placeholder: 'Email',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    amount: {
      field_name: 'amount',
      db_name: 'amount',
      type: 'text',
      placeholder: 'Amount',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    currency: {
      field_name: 'currency',
      db_name: 'currency',
      type: 'text',
      placeholder: 'Currency',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    member_transaction_id: {
      field_name: 'member_transaction_id',
      db_name: 'member_transaction_id',
      type: 'text',
      placeholder: 'Transaction ID',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    requested_on: {
      field_name: 'requested_on',
      db_name: 'requested_on',
      type: 'text',
      placeholder: 'Requested on',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    status: {
      field_name: 'status',
      db_name: 'status',
      type: 'text',
      placeholder: 'Status',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    note: {
      field_name: 'note',
      db_name: 'note',
      type: 'text',
      placeholder: 'Note',
      listing: false,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    created_at: {
      field_name: 'created_at',
      db_name: 'created_at',
      type: 'text',
      placeholder: 'Created at',
      listing: false,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    ip: {
      field_name: 'ip',
      db_name: 'ip',
      type: 'text',
      placeholder: 'IP',
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    '$MemberTransaction.transaction_id$': {
      field_name: 'MemberTransaction.transaction_id',
      db_name: '`MemberTransaction`.`transaction_id`',
      type: 'text',
      placeholder: 'Transaction ID',
      listing: true,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
    '$Member.username$': {
      field_name: 'Member.username',
      db_name: '`Member`.`username`',
      type: 'text',
      placeholder: 'Username',
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
    '$Member.admin_status$': {
      field_name: 'Member.admin_status',
      db_name: '`Member`.`admin_status`',
      type: 'text',
      placeholder: 'Admin Status',
      listing: true,
      show_in_form: false,
      sort: true,
      required: false,
      value: '',
      width: '50',
      searchable: true,
    },
    '$Member.first_name$': {
      field_name: 'Member. ',
      db_name: 'Member.first_name',
      type: 'text',
      placeholder: 'Member Name',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    '$User.alias_name$': {
      field_name: 'User.alias_name',
      db_name: 'User.alias_name',
      type: 'text',
      placeholder: 'Transaction Made By',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    warning: {
      field_name: 'warning',
      db_name: 'warning',
      type: 'text',
      placeholder: 'Warning',
      listing: true,
      show_in_form: false,
      sort: false,
      required: false,
      value: '',
      width: '50',
      searchable: false,
    },
  };
  sequelizePaginate.paginate(WithdrawalRequest);

  WithdrawalRequest.getPendingRequest = async (
    withdrawal_type_id,
    company_portal_id,
    Member
  ) => {
    var where_cond = { status: 'pending' };
    if (withdrawal_type_id != '') {
      where_cond['withdrawal_type_id'] = withdrawal_type_id;
    }
    let result = await WithdrawalRequest.findAndCountAll({
      where: where_cond,
      include: {
        model: Member,
        attributes: ['id'],
        where: { company_portal_id: company_portal_id },
      },
      subQuery: false,
    });
    return result.count;
  };
  //check approved withdrawal request
  WithdrawalRequest.withdrawalRequestAmountValidation = async (
    payment_method_details,
    withdrawal_amount,
    member_id,
    member
  ) => {
    // console.log(payment_method_details, withdrawal_amount, member_id, member);
    const { MemberTransaction } = require('../models/index');
    const { QueryTypes, Op } = require('sequelize');
    //check all conditions for amount
    var resp = {
      member_status: true,
      member_message: '',
    };
    if (
      parseFloat(payment_method_details.minimum_amount) > 0 &&
      withdrawal_amount < parseFloat(payment_method_details.minimum_amount)
    ) {
      resp.member_status = false;
      resp.member_message =
        'Amount must be more than $' + payment_method_details.minimum_amount;
    }
    if (
      parseFloat(payment_method_details.maximum_amount) > 0 &&
      withdrawal_amount > parseFloat(payment_method_details.maximum_amount)
    ) {
      resp.member_status = false;
      resp.member_message =
        'Amount must be less than $' + payment_method_details.maximum_amount;
    }
    if (
      parseFloat(payment_method_details.fixed_amount) > 0 &&
      withdrawal_amount !== parseFloat(payment_method_details.fixed_amount)
    ) {
      resp.member_status = false;
      resp.member_message =
        'Amount must be fixed to $' + payment_method_details.fixed_amount;
    }

    if (withdrawal_amount > parseFloat(member.member_amounts[0].amount)) {
      resp.member_status = false;
      resp.member_message = 'Please check your balance';
    }

    let total_approved_amount = 0;
    let total_pending_amount = 0;

    //Start - check pending withdrawal request
    let pending_withdrawal_req_amount = await WithdrawalRequest.findOne({
      // logging: console.log,
      attributes: [
        [
          sequelize.fn(
            'IFNULL',
            sequelize.fn('SUM', sequelize.col('WithdrawalRequest.amount')),
            0
          ),
          'total',
        ],
      ],
      where: {
        status: 'pending',
        member_id: member_id,
      },
      include: {
        model: MemberTransaction,
        attributes: ['id'],
        where: {
          status: { [Op.ne]: 2 },
        },
        required: false,
      },
    });
    // console.log('pending_withdrawal_req_amount', pending_withdrawal_req_amount);
    total_pending_amount = pending_withdrawal_req_amount.dataValues.total
      ? parseFloat(pending_withdrawal_req_amount.dataValues.total)
      : 0;
    if (
      member.member_amounts[0].amount <
      total_pending_amount + withdrawal_amount
    ) {
      resp.member_status = false;
      resp.member_message =
        'You already have pending withdrawal requests. This request might exceed your balance. Please contact to admin.';
    }
    //End - check pending withdrawal request

    //Start - check approved withdrawal request
    let approved_withdrawal_req_amount = await WithdrawalRequest.findOne({
      // logging: console.log,
      attributes: [
        [
          sequelize.fn(
            'IFNULL',
            sequelize.fn('SUM', sequelize.col('WithdrawalRequest.amount')),
            0
          ),
          'total',
        ],
      ],
      where: {
        status: 'approved',
        member_id: member_id,
      },
      include: {
        model: MemberTransaction,
        attributes: ['id'],
        where: {
          status: { [Op.ne]: 2 },
        },
        required: true,
      },
    });
    // console.log(
    //   'approved_withdrawal_req_amount',
    //   approved_withdrawal_req_amount
    // );
    total_approved_amount = approved_withdrawal_req_amount.dataValues.total
      ? parseFloat(approved_withdrawal_req_amount.dataValues.total)
      : 0;
    if (
      member.member_amounts[0].amount <
      total_pending_amount + total_approved_amount + withdrawal_amount
    ) {
      resp.member_status = false;
      resp.member_message =
        'You already have some approved withdrawal requests which are still under process. This request might exceed your balance. Please contact to admin.';
    }
    return resp;
    //End - check approved withdrawal request
  };
  //Withdrawal form validation
  WithdrawalRequest.withdrawalRequestFieldValidation = async (
    payment_method_details,
    request_data
  ) => {
    //Start - Withdrawal form validation
    var payment_field = [];
    var member_payment_info = [];
    for (const option of payment_method_details.PaymentMethodFieldOptions) {
      var field_name = option.field_name.toLowerCase().replaceAll(' ', '');
      const option_arr = ['email', 'phone', 'username'];
      if (option_arr.includes(field_name)) {
        payment_field.push(request_data[field_name]);
        member_payment_info.push({
          field_name: field_name,
          field_value: request_data[field_name],
        });
      }
      if (request_data[field_name] === '') {
        return {
          member_status: false,
          member_message: 'Please enter ' + option.field_name.toLowerCase(),
        };
      }
      if (option.field_type !== 'input') {
        var regex = '';
        if (option.field_type === 'email')
          regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (option.field_type === 'number')
          regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

        if (!regex.test(request_data[field_name])) {
          // if (!request_data.payment_field.match(regex)) {
          return {
            member_status: false,
            member_message:
              'Please enter valid ' + option.field_name.toLowerCase(),
          };
        }
      }
    }
    //End - Withdrawal form validation

    return { member_status: true, payment_field, member_payment_info };
  };
  //check for same payment info
  WithdrawalRequest.checkIfSamePaymentInfo = async (
    payment_field,
    member_id
  ) => {
    const { Op } = require('sequelize');
    let check_same_acc = await WithdrawalRequest.count({
      where: {
        payment_email: payment_field,
        member_id: { [Op.ne]: member_id },
      },
    });
    // console.log(check_same_acc);
    if (check_same_acc > 0) {
      return {
        member_status: false,
        member_message:
          'This payment info has already been used by another account, please reach out to our admin',
      };
    }
    return {
      member_status: true,
      member_message: '',
    };
  };
  //Rejected or failed withdrawal req
  WithdrawalRequest.rejectedOrFailedRequest = async (
    model_ids,
    user_id,
    withdrawal_status
  ) => {
    const { Op } = require('sequelize');
    const {
      MemberTransaction,
      Member,
      MemberBalance,
    } = require('../models/index');
    var withdrawal_reqs = await WithdrawalRequest.findAll({
      where: {
        id: {
          [Op.in]: model_ids,
        },
      },
      attributes: [
        'id',
        'member_id',
        'amount',
        'currency',
        'payment_email',
        'member_transaction_id',
        'withdrawal_type_id',
      ],
      include: {
        model: Member,
        attributes: ['first_name', 'last_name', 'username'],
        include: {
          model: MemberBalance,
          as: 'member_amounts',
          attributes: ['amount', 'member_id'],
          where: { amount_type: 'cash' },
        },
      },
    });
    let transaction_data = [];
    let transaction_ids = [];
    let withdrawal_ids = [];
    for (let record of withdrawal_reqs) {
      // console.log(record);
      // console.log(record.Member.member_amounts);
      let updated_amount =
        parseFloat(record.Member.member_amounts[0].amount) +
        parseFloat(record.amount);
      // console.log(updated_amount);
      withdrawal_ids.push(record.id);
      transaction_ids.push(record.member_transaction_id);
      transaction_data.push({
        member_id: record.member_id,
        amount: record.amount,
        note: 'Rejected Withdrawal request for $' + record.amount,
        type: 'credited',
        amount_action: 'member_withdrawal',
        created_by: user_id || '',
        status: withdrawal_status == 'rejected' ? 2 : 3,
        parent_transaction_id: record.member_transaction_id,
        completed_at: new Date(),
        balance: updated_amount,
        payload: null,
        currency: 'USD',
      });
      await MemberBalance.update(
        { amount: updated_amount },
        { where: { member_id: record.member_id, amount_type: 'cash' } }
      );
    }
    // console.log(
    //   '-------------------------',
    //   transaction_data,
    //   transaction_ids,
    //   withdrawal_ids
    // );
    // console.log(
    //   '-------------------------',
    //   transaction_data.length,
    //   transaction_ids.length,
    //   withdrawal_ids.length
    // );
    if (transaction_data.length > 0) {
      var transaction_resp = await MemberTransaction.bulkCreate(
        transaction_data
      );
    }
    if (transaction_ids.length > 0) {
      await MemberTransaction.update(
        { status: 4 },
        { where: { id: transaction_ids } }
      );
    }
    if (withdrawal_ids.length > 0) {
      await WithdrawalRequest.update(
        { status: withdrawal_status },
        { where: { id: withdrawal_ids } }
      );
    }
  };
  //Approved and completed withdrawal req
  WithdrawalRequest.approvedAndCompletedReqs = async (
    transaction_ids,
    withdrawal_ids,
    req_body = ''
  ) => {
    const { MemberTransaction } = require('../models/index');
    console.log(
      '------approvedAndCompletedReqs',
      transaction_ids,
      withdrawal_ids,
      req_body
    );
    if (transaction_ids.length > 0) {
      await MemberTransaction.update(
        {
          status: 2,
          payload: req_body,
        },
        { where: { id: transaction_ids } }
      );
    }
    // if (withdrawal_ids.length > 0) {
    await WithdrawalRequest.update(
      { status: 'completed' },
      { where: { id: withdrawal_ids } }
    );
    // }
  };
  return WithdrawalRequest;
};
