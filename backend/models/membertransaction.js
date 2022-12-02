"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");
const Joi = require("joi");
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
        foreignKey: "member_payment_information_id",
      });
    }
  }
  MemberTransaction.init(
    {
      member_payment_information_id: DataTypes.BIGINT,
      type: DataTypes.ENUM("credited", "withdraw"),
      amount: DataTypes.DECIMAL(10, 2),
      completed_at: "TIMESTAMP",
      transaction_id: DataTypes.STRING,
      member_id: DataTypes.BIGINT,
      status: DataTypes.TINYINT,
      note: DataTypes.STRING,
      amount_action: DataTypes.ENUM("admin_adjustment", "survey", "referral"),
      currency: DataTypes.STRING,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: "TIMESTAMP",
      updated_at: "TIMESTAMP",
      deleted_at: "TIMESTAMP",
    },
    {
      sequelize,
      modelName: "MemberTransaction",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at", // alias createdAt as created_date
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "member_transactions",
    }
  );
  //fields
  MemberTransaction.fields = {
    id: {
      field_name: "id",
      db_name: "id",
      type: "text",
      placeholder: "Id",
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: "",
      width: "50",
      searchable: false,
    },
    member_payment_information_id: {
      field_name: "member_payment_information_id",
      db_name: "member_payment_information_id",
      type: "text",
      placeholder: "Member Payment Information ID",
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: false,
    },
    type: {
      field_name: "type",
      db_name: "type",
      type: "text",
      placeholder: "Type",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    amount: {
      field_name: "amount",
      db_name: "amount",
      type: "text",
      placeholder: "Amount",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    completed_at: {
      field_name: "completed_at",
      db_name: "completed_at",
      type: "text",
      placeholder: "Completed At",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    transaction_id: {
      field_name: "transaction_id",
      db_name: "transaction_id",
      type: "text",
      placeholder: "Transaction ID",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    status: {
      field_name: "status",
      db_name: "status",
      type: "text",
      placeholder: "Status",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    note: {
      field_name: "note",
      db_name: "note",
      type: "text",
      placeholder: "Note",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    created_at: {
      field_name: "created_at",
      db_name: "created_at",
      type: "text",
      placeholder: "Created at",
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: false,
    },
    updated_at: {
      field_name: "updated_at",
      db_name: "updated_at",
      type: "text",
      placeholder: "Updated at",
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: false,
    },
  };
  sequelizePaginate.paginate(MemberTransaction);
  return MemberTransaction;
};