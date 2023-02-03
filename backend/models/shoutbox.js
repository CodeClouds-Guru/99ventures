'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shoutbox extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Shoutbox.init({
    company_id: DataTypes.BIGINT,
    company_portal_id: DataTypes.BIGINT,
    member_id: DataTypes.BIGINT,
    survey_provider_id: DataTypes.BIGINT,
    verbose: DataTypes.TEXT,
    created_at: "TIMESTAMP",
    updated_at: "TIMESTAMP",
    deleted_at: "TIMESTAMP",
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
  }, {
    sequelize,
    modelName: 'Shoutbox',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at", // alias createdAt as created_date
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "shoutboxes",
  });
  Shoutbox.fields = {
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
    company_id: {
      field_name: "company_id",
      db_name: "company_id",
      type: "text",
      placeholder: "company_id",
      listing: false,
      show_in_form: false,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: false,
    },
    company_portal_id: {
      field_name: "company_portal_id",
      db_name: "company_portal_id",
      type: "text",
      placeholder: "Company Portal Id",
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: "",
      width: "50",
      searchable: false,
    },
    member_id: {
      field_name: "member_id",
      db_name: "member_id",
      type: "text",
      placeholder: "Member ID",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    survey_provider_id: {
      field_name: "survey_provider_id",
      db_name: "survey_provider_id",
      type: "text",
      placeholder: "Survey Provider ID",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    verbose: {
      field_name: "verbose",
      db_name: "verbose",
      type: "text",
      placeholder: "verbose",
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
  };
  return Shoutbox;
};