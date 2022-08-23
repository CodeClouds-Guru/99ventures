'use strict';
const {
  Model
} = require('sequelize');
const sequelizePaginate = require("sequelize-paginate");
const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  class CompanyPortal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CompanyPortal.validate = function (req) {
    const schema = Joi.object({
      name: Joi.string().required(),
      company_id: Joi.required(),
      domain: Joi.string(),
      downtime_message: Joi.string(),
      status: Joi.number()

    });
    return schema.validate(req.body);
  };
  CompanyPortal.init({
    company_id: DataTypes.BIGINT,
    domain: DataTypes.STRING,
    name: DataTypes.STRING,
    downtime_message: DataTypes.TEXT,
    status: DataTypes.INTEGER,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: DataTypes.TIME,
    updated_at: DataTypes.TIME,
    deleted_at: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'CompanyPortal',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
    deletedAt: "deleted_at",
    tableName: "company_portals"
  });
  CompanyPortal.fields = {
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
      placeholder: "Company Id",
      listing: true,
      show_in_form: false,
      sort: false,
      required: false,
      value: "",
      width: "50",
      searchable: false,
    },
    domain: {
      field_name: "domain",
      db_name: "domain",
      type: "text",
      placeholder: "Domain",
      listing: true,
      show_in_form: false,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    name: {
      field_name: "name",
      db_name: "name",
      type: "text",
      placeholder: "Name",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    downtime_message: {
      field_name: "downtime_message",
      db_name: "downtime_message",
      type: "text",
      placeholder: "Downtime Message",
      listing: true,
      show_in_form: true,
      sort: true,
      required: false,
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
      placeholder: "Created At",
      listing: true,
      show_in_form: false,
      sort: true,
      required: false,
      value: "",
      width: "50",
      searchable: true,
    },
  };
  sequelizePaginate.paginate(CompanyPortal);
  return CompanyPortal;
};