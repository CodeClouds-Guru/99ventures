'use strict';
const {
  Model
} = require('sequelize');
const Joi = require("joi");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class ShoutboxConfiguration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ShoutboxConfiguration.init({
    company_portal_id: DataTypes.BIGINT,
    event_name: DataTypes.STRING,
    verbose: DataTypes.TEXT,
    event_slug: DataTypes.STRING,
    status: { type: DataTypes.TINYINT, defaultValue: '1' },
    created_at: "TIMESTAMP",
    updated_at: "TIMESTAMP",
    deleted_at: "TIMESTAMP",
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
  }, {
    sequelize,
    modelName: 'ShoutboxConfiguration',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at", // alias createdAt as created_date
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "shoutbox_configurations",
  });
  ShoutboxConfiguration.fields = {
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
    event_name: {
      field_name: "event_name",
      db_name: "event_name",
      type: "text",
      placeholder: "Event Name",
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
      placeholder: "Verbose",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    event_slug: {
      field_name: "event_slug",
      db_name: "event_slug",
      type: "text",
      placeholder: "Event Slug",
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
  ShoutboxConfiguration.validate = function (req) {
    const schema = Joi.object({
      status: Joi.required(),
      verbose: Joi.string().required(),
    })
    return schema.validate(req.body)
  }
  sequelizePaginate.paginate(ShoutboxConfiguration);
  return ShoutboxConfiguration;
};