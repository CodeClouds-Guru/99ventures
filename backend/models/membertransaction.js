'use strict';
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const Joi = require('joi');

module.exports = (sequelize, DataTypes) => {
  class MemberTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MemberTransaction.belongsTo(models.MemberPaymentInformation, {
        foreignKey: 'member_payment_information_id',
      });
      MemberTransaction.belongsTo(models.Member, {
        foreignKey: 'member_id',
      });
      MemberTransaction.belongsToMany(models.Survey, {
        through: 'member_surveys',
        timestamps: false,
        foreignKey: 'member_transaction_id',
        otherKey: 'survey_id',
      });
    }
  }
  MemberTransaction.init(
    {
      member_payment_information_id: DataTypes.BIGINT,
      type: DataTypes.ENUM('credited', 'withdraw'),
      amount: DataTypes.DECIMAL(10, 2),
      balance: DataTypes.DECIMAL(10, 2),
      completed_at: 'TIMESTAMP',
      transaction_id: DataTypes.STRING,
      member_id: DataTypes.BIGINT,
      status: DataTypes.TINYINT,
      note: DataTypes.STRING,
      amount_action: DataTypes.ENUM('admin_adjustment', 'survey', 'referral'),
      currency: DataTypes.STRING,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'MemberTransaction',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'member_transactions',
    }
  );
  //fields
  MemberTransaction.fields = {
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
    completed_at: {
      field_name: 'completed_at',
      db_name: 'completed_at',
      type: 'text',
      placeholder: 'Transaction Date',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    transaction_id: {
      field_name: 'transaction_id',
      db_name: 'transaction_id',
      type: 'text',
      placeholder: 'Transaction ID',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    member_payment_information_id: {
      field_name: 'member_payment_information_id',
      db_name: 'member_payment_information_id',
      type: 'text',
      placeholder: 'Member Payment Information ID',
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
    type: {
      field_name: 'type',
      db_name: 'type',
      type: 'text',
      placeholder: 'Type',
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
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
    },
    balance: {
      field_name: 'balance',
      db_name: 'balance',
      type: 'text',
      placeholder: 'Balance',
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
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
    updated_at: {
      field_name: 'updated_at',
      db_name: 'updated_at',
      type: 'text',
      placeholder: 'Updated at',
      listing: false,
      show_in_form: false,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: false,
    },
  };
  sequelizePaginate.paginate(MemberTransaction);

  MemberTransaction.updateMemberTransactionAndBalance = async (data) => {
    const db = require('../models/index');

    const { QueryTypes, Op } = require('sequelize');
    const { MemberBalance } = require('../models/index');
    console.log(data);
    let total_earnings = await db.sequelize.query(
      "SELECT id, amount as total_amount, amount_type FROM `member_balances` WHERE member_id=? AND amount_type='cash'",
      {
        replacements: [data.member_id],
        type: QueryTypes.SELECT,
      }
    );

    let modified_total_earnings =
      parseFloat(total_earnings[0].total_amount) + parseFloat(data.amount);
    let transaction_data = {
      type: data.type,
      amount: parseFloat(data.amount),
      status: 2,
      note: data.note,
      created_by: data.created_by,
      member_id: data.member_id,
      amount_action: data.amount_action,
      completed_at: new Date(),
      transaction_id: data.transaction_id || null,
      balance: modified_total_earnings,
      payload: data.payload || null,
    };
    console.log(transaction_data);
    let transaction = await MemberTransaction.create(transaction_data, {
      silent: true,
    });
    let balance = await MemberBalance.update(
      { amount: modified_total_earnings },
      {
        where: { id: total_earnings[0].id },
      }
    );
    if (transaction && balance) {
      return true;
    } else {
      return false;
    }
  };
  return MemberTransaction;
};
