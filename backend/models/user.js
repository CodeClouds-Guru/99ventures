"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");
const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.validate = function (req) {
    const schema = Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
      phone_no: Joi.string().required(),
      email: Joi.string().email().required(),
    });
    return schema.validate(req.body);
  };

  User.init(
    {
      first_name: { type: DataTypes.STRING },
      last_name: DataTypes.STRING,
      username: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: "Email address already in use!",
        },
      },
      avatar: DataTypes.STRING,
      password: DataTypes.STRING,
      phone_no: DataTypes.STRING,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "User",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at", // alias createdAt as created_date
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "users",      
    }
  );

  User.fields = {
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
    first_name: {
      field_name: "first_name",
      db_name: "first_name",
      type: "text",
      placeholder: "First Name",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    last_name: {
      field_name: "last_name",
      db_name: "last_name",
      type: "text",
      placeholder: "Last Name",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    email: {
      field_name: "email",
      db_name: "email",
      type: "text",
      placeholder: "Email",
      listing: true,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: true,
    },
    username: {
      field_name: "username",
      db_name: "username",
      type: "text",
      placeholder: "Username",
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
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: false,
    },
  };
  sequelizePaginate.paginate(User);
  return User;
};
