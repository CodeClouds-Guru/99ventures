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
      MemberTransaction.hasOne(models.WithdrawalRequest, {
        foreignKey: 'member_transaction_id',
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
      batch_id: DataTypes.STRING,
      payment_gateway_json: DataTypes.JSON,
      amount_action: {
        type: DataTypes.ENUM(
          'admin_adjustment',
          'survey',
          'referral',
          'member_withdrawal',
          'registration_bonus'
        ),
        get() {
          let rawValue = this.getDataValue('amount_action') || null;
          rawValue = rawValue ? rawValue.replaceAll('_', ' ') : '';
          return rawValue
            .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
              return index == 0 ? word.toUpperCase() : word.toLowerCase();
            })
            .replace(/\s+/g, ' ');
        },
      },
      currency: DataTypes.STRING,
      parent_transaction_id: DataTypes.BIGINT,
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
    const { MemberBalance, MemberNotification } = require('../models/index');

    let total_earnings = await db.sequelize.query(
      "SELECT id, amount as total_amount, amount_type FROM `member_balances` WHERE member_id=? AND amount_type='cash'",
      {
        replacements: [data.member_id],
        type: QueryTypes.SELECT,
      }
    );
    let modified_total_earnings = parseFloat(total_earnings[0].total_amount);
    data.status = data.status || 0;

    if (parseInt(data.status) == 0 || parseInt(data.status) == 2) {
      modified_total_earnings =
        modified_total_earnings + parseFloat(data.amount);
    }

    data.modified_total_earnings = modified_total_earnings;

    //this member insert transaction
    let transaction = JSON.parse(
      JSON.stringify(await MemberTransaction.insertTransaction(data))
    );
    // console.log(transaction);
    let balance = true;
    if (parseInt(data.status) == 0 || parseInt(data.status) == 2) {
      balance = await MemberTransaction.updateMemberBalance({
        amount: modified_total_earnings,
        member_id: data.member_id,
      });

      //referral member section
      if (data.type === 'credited') {
        let referral_data = await MemberTransaction.referralAmountUpdate(
          data.member_id,
          data.amount,
          transaction.id
        );
      }
    }

    //Notify member
    if (
      parseInt(data.status) === 1 &&
      data.amount_action === 'member_withdrawal'
    ) {
      await MemberNotification.addMemberNotification({
        member_id: data.member_id,
        verbose:
          'Withdrawal request initiated for $' +
          parseFloat(Math.abs(data.amount)) +
          ' on ' +
          new Date().toLocaleDateString(),
        action: 'member_withdrawal',
      });
    }

    if (transaction && balance) {
      return { status: true, transaction_id: transaction.id };
    } else {
      return false;
    }
  };

  MemberTransaction.getTransactionCount = async (member_id) => {
    const { sequelize } = require('../models/index');
    const moment = require('moment');
    let option = {};

    option.attributes = [
      [
        sequelize.literal(
          `SUM(CASE WHEN MemberTransaction.completed_at BETWEEN '${moment()
            .startOf('day')
            .format('YYYY-MM-DD HH:mm:ss')}' AND '${moment()
            .endOf('day')
            .format(
              'YYYY-MM-DD HH:mm:ss'
            )}' THEN MemberTransaction.amount ELSE 0.00 END)`
        ),
        'today',
      ],
      [
        sequelize.literal(
          `SUM(CASE WHEN MemberTransaction.completed_at BETWEEN '${moment()
            .subtract(6, 'days')
            .format('YYYY-MM-DD HH:mm:ss')}' AND '${moment()
            .endOf('day')
            .format(
              'YYYY-MM-DD HH:mm:ss'
            )}' THEN MemberTransaction.amount ELSE 0.00 END)`
        ),
        'week',
      ],
      [
        sequelize.literal(
          `SUM(CASE WHEN MemberTransaction.completed_at BETWEEN '${moment()
            .subtract(30, 'days')
            .format('YYYY-MM-DD HH:mm:ss')}' AND '${moment()
            .endOf('day')
            .format(
              'YYYY-MM-DD HH:mm:ss'
            )}' THEN MemberTransaction.amount ELSE 0.00 END)`
        ),
        'month',
      ],
      [sequelize.fn('sum', sequelize.col('amount')), 'total'],
    ];
    option.where = {
      member_id: member_id,
      type: 'credited',
      status: 2,
    };
    // console.log(option);
    let response = await MemberTransaction.findOne(option);
    // console.log(response);
    return JSON.parse(JSON.stringify(response));
  };

  MemberTransaction.referralAmountUpdate = async (
    member_id,
    modified_total_earnings,
    parent_transaction_id
  ) => {
    const {
      MemberBalance,
      Member,
      Setting,
      MemberNotification,
    } = require('../models/index');
    let member = JSON.parse(
      JSON.stringify(
        await Member.findOne({
          where: { id: member_id },
          attributes: ['member_referral_id'],
          include: {
            model: MemberBalance,
            as: 'member_amounts',
            attributes: ['amount'],
            where: { amount_type: 'cash' },
          },
        })
      )
    );
    let referral_member = JSON.parse(
      JSON.stringify(
        await Member.findOne({
          where: { id: member.member_referral_id },
          attributes: ['member_referral_id'],
          include: {
            model: MemberBalance,
            as: 'member_amounts',
            attributes: ['amount'],
            where: { amount_type: 'cash' },
          },
        })
      )
    );

    if (member.member_referral_id) {
      let config_data = await Setting.findOne({
        attributes: ['settings_value'],
        where: { settings_key: 'referral_percentage' },
      });
      let referral_amount =
        (modified_total_earnings *
          parseFloat(config_data.dataValues.settings_value)) /
        100;

      let ref_modified_total_earnings =
        parseFloat(referral_member.member_amounts[0].amount) +
        parseFloat(referral_amount);

      JSON.parse(
        JSON.stringify(
          await MemberTransaction.insertTransaction({
            type: 'credited',
            amount: parseFloat(referral_amount),
            note: 'Referral percentage',
            member_id: member.member_referral_id,
            amount_action: 'referral',
            modified_total_earnings: ref_modified_total_earnings,
            parent_transaction_id: parent_transaction_id,
          })
        )
      );
      await MemberTransaction.updateMemberBalance({
        amount: ref_modified_total_earnings,
        member_id: member.member_referral_id,
      });

      await MemberNotification.addMemberNotification({
        member_id: member_id,
        verbose:
          'Referral bonus received for $' +
          parseFloat(Math.abs(referral_amount)) +
          ' on ' +
          new Date().toLocaleDateString(),
        action: 'referral_bonus',
      });
    }
    return {
      status: true,
      data: { ref_id: member.member_referral_id },
    };
  };

  MemberTransaction.insertTransaction = async (data) => {
    // console.log(data);
    let transaction_data = {
      type: data.type,
      amount: parseFloat(data.amount),
      status: data.status || 0,
      note: data.note,
      created_by: data.created_by || null,
      member_id: data.member_id,
      amount_action: data.amount_action,
      completed_at: new Date(),
      transaction_id: data.transaction_id || null,
      balance: data.modified_total_earnings,
      payload: data.payload || null,
      currency: data.currency || 'USD',
      parent_transaction_id: data.parent_transaction_id || null,
    };

    return await MemberTransaction.create(transaction_data, {
      silent: true,
    });
  };

  MemberTransaction.updateMemberBalance = async (data) => {
    const { MemberBalance } = require('../models/index');
    await MemberBalance.update(
      { amount: data.amount },
      {
        where: {
          member_id: data.member_id,
          amount_type: 'cash',
        },
      }
    );
    return true;
  };
  return MemberTransaction;
};
