"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");
const Joi = require("joi");
// const {MemberNote} = require("../models/index");
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Member.hasMany(models.MemberNote, {
        foreignKey: "member_id",
      });
      Member.hasMany(models.IpLog, {
        foreignKey: "member_id",
      });
      Member.belongsTo(models.MembershipTier, {
        foreignKey: "membership_tier_id",
      });
      Member.belongsTo(models.Country, {
        foreignKey: "country_id",
      });
      Member.hasMany(models.MemberTransaction, {
        foreignKey: "member_id",
      });
      Member.hasMany(models.MemberPaymentInformation, {
        foreignKey: "member_id",
      });
      Member.belongsTo(models.MemberReferral, {
        foreignKey: "member_referral_id",
      });
      Member.hasMany(models.MemberBalance, {
        foreignKey: "member_id",
        as: "member_amounts",
      });
      Member.hasMany(models.MemberReferral, {
        foreignKey: "referral_id",
      });
      Member.belongsTo(models.CompanyPortal, {
        foreignKey: "company_portal_id",
      });
      Member.belongsToMany(models.Survey, {
        through: 'member_surveys',
        timestamps: false,
        foreignKey: 'member_id',
        otherKey: 'survey_id',
      })
    }
  }
  Member.validate = function (req) {
    const schema = Joi.object({
      first_name: Joi.string().required().label("First Name"),
      last_name: Joi.string().required().label("Last Name"),
      gender: Joi.string().required().label("Gender"),
      status: Joi.string().optional().label("Status"),
      username: Joi.string().min(3).max(30).required().label("Username"),
      email: Joi.string().optional(),
      company_portal_id: Joi.string().optional(),
      company_id: Joi.string().optional(),
      password: Joi.string().optional(),
      dob: Joi.string().optional(),
      phone_no: Joi.string().optional().label("Phone No"),
      country_id: Joi.optional().label("Country"),
      membership_tier_id: Joi.optional().label("Level"),
      address_1: Joi.string().allow("").required().label("Address 1"),
      address_2: Joi.string().allow("").optional().label("Address 2"),
      address_3: Joi.string().allow("").optional().label("Address 3"),
      zip_code: Joi.string().allow("").optional().label("Zip Code"),
      avatar: Joi.optional().label("Avatar"),
      country_code: Joi.optional().label("Country Code"),
    });
    return schema.validate(req.body);
  };

  Member.init(
    {
      company_portal_id: DataTypes.BIGINT,
      company_id: DataTypes.BIGINT,
      membership_tier_id: DataTypes.BIGINT,
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      username: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: "Username already in use!",
        },
      },
      email: DataTypes.STRING,
      status: DataTypes.STRING,
      phone_no: DataTypes.STRING,
      country_code: {
        type: DataTypes.INTEGER,
        set(value) {
          if (value == "" || value == null)
            this.setDataValue("country_code", null);
          else this.setDataValue("country_code", value);
        },
      },
      dob: DataTypes.DATE,
      member_referral_id: DataTypes.INTEGER,
      password: DataTypes.STRING,
      last_active_on: "TIMESTAMP",
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: "TIMESTAMP",
      updated_at: "TIMESTAMP",
      deleted_at: "TIMESTAMP",
      avatar: {
        type: DataTypes.STRING,
        get() {
          let rawValue = this.getDataValue("avatar") || null;
          if (rawValue == null || rawValue == "") {
            const publicURL =
              process.env.CLIENT_API_PUBLIC_URL || "http://127.0.0.1:4000";
            rawValue ? rawValue : `${publicURL}/images/demo-user.png`;
          } else {
            rawValue = process.env.S3_BUCKET_OBJECT_URL + rawValue;
          }
          return rawValue;
        },
        set(value) {
          console.log("avatar", value);
          if (value == "" || value == null) this.setDataValue("avatar", null);
          else this.setDataValue("avatar", value);
        },
      },
      referral_code: DataTypes.STRING,
      address_1: DataTypes.STRING,
      address_2: DataTypes.STRING,
      address_3: DataTypes.STRING,
      zip_code: DataTypes.STRING,
      country_id: {
        type: DataTypes.INTEGER,
        set(value) {
          console.log("country_id", value);
          if (value == "" || value == null)
            this.setDataValue("country_id", null);
          else this.setDataValue("country_id", value);
        },
      },
      gender: DataTypes.ENUM("male", "female", "other"),
    },
    {
      sequelize,
      modelName: "Member",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at", // alias createdAt as created_date
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "members",
    }
  );


  Member.fields = {
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
    username: {
      field_name: "username",
      db_name: "username",
      type: "text",
      placeholder: "User Name",
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
    gender: {
      field_name: "gender",
      db_name: "gender",
      type: "text",
      placeholder: "Gender",
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
      show_in_form: false,
      sort: false,
      required: false,
      value: "",
      width: "50",
      searchable: true,
    },
    phone_no: {
      field_name: "phone_no",
      db_name: "phone_no",
      type: "text",
      placeholder: "Phone No",
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: false,
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

  sequelizePaginate.paginate(Member);

  Member.changeStatus = async (req) => {
    const { MemberNote } = require("../models/index");

    const value = req.body.value || "";
    const field_name = req.body.field_name || "";
    const id = req.params.id || null;
    const notes = req.body.member_notes || null;
    try {
      let member = await Member.findOne({
        attributes: ["status"],
        where: { id: id },
      });
      console.log(req);
      let result = await Member.update(
        {
          [field_name]: value,
        },
        {
          where: { id: id },
          return: true,
        }
      );
      if (notes !== null) {
        let data = {
          user_id: req.user.id,
          member_id: id,
          previous_status: member.status,
          current_status: value,
          note: notes,
        };
        console.log("MemberNote===========", MemberNote);
        await MemberNote.create(data);
      }
      return result[0];
    } catch (error) {
      console.error(error);
      // this.throwCustomError("Unable to save data", 500);
    }
  };
  return Member;
};
