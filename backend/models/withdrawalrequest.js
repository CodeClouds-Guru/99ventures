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
    }
  }
  WithdrawalRequest.init(
    {
      member_id: DataTypes.BIGINT,
      member_transaction_id: DataTypes.BIGINT,
      amount: DataTypes.FLOAT,
      amount_type: DataTypes.ENUM('cash', 'point'),
      currency: DataTypes.STRING,
      withdrawal_type_id: DataTypes.BIGINT,
      requested_on: 'TIMESTAMP',
      status: DataTypes.ENUM('approved', 'pending', 'rejected', 'expired'),
      transaction_time: DataTypes.TIME,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      transaction_made_by: DataTypes.BIGINT,
      note: DataTypes.TEXT,
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
  WithdrawalRequest.extra_fields = ['Member.first_name', 'User.alias_name'];
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
    '$Member.first_name$': {
      field_name: 'Member.first_name',
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
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: '',
      width: '50',
      searchable: true,
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
  };
  sequelizePaginate.paginate(WithdrawalRequest);
  return WithdrawalRequest;
};
