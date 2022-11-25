"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");
const Joi = require("joi");
const { stringToSlug, createCommentSignature } = require("../helpers/global");

module.exports = (sequelize, DataTypes) => {
  class Component extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Component.init(
    {
      company_portal_id: DataTypes.BIGINT,
      name: DataTypes.STRING,
      html: DataTypes.TEXT("long"),
      code: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: "Code already in use!",
        },
      },
      component_json: DataTypes.JSON,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "Component",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at", // alias createdAt as created_date
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "components",
      hooks: {
        beforeCreate: async (component, options) => {
          if (component.code == null) {
            let code = stringToSlug(component.name);
            let check_code_unique = await Component.findOne({
              where: { code: code },
            });

            if (check_code_unique) {
              var date = new Date();
              component.code = code + "-" + date.getTime();
            } else {
              component.code = code;
            }
          }
          const { start, end } = createCommentSignature(component.code);
          if (component.code.indexOf('-rev-') < 0) {
            if (component.html.indexOf(start) < 0) {
              component.html = `${start} \n ${component.html}`;
            }
            if (component.html.indexOf(end) < 0) {
              component.html = `${component.html} \n ${end}`;
            }
          }
        },
        beforeBulkUpdate: (component, options) => {
          if (component.attributes.code.indexOf('-rev-') < 0) {
            const { start, end } = createCommentSignature(component.attributes.code);
            if (component.attributes.html.indexOf(start) < 0) {
              component.attributes.html = `${start} \n ${component.attributes.html}`;
            }
            if (component.attributes.html.indexOf(end) < 0) {
              component.attributes.html = `${component.attributes.html} \n ${end}`;
            }
          }
          delete component.attributes.code;
        },
      },
    }
  );
  Component.fields = {
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
      placeholder: "Company portal id",
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: false,
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
    html: {
      field_name: "html",
      db_name: "html",
      type: "text",
      placeholder: "HTML",
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: false,
    },
    component_json: {
      field_name: "component_json",
      db_name: "component_json",
      type: "text",
      placeholder: "JSON",
      listing: false,
      show_in_form: true,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: false,
    },
    code: {
      field_name: "code",
      db_name: "code",
      type: "text",
      placeholder: "Code",
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
  //validation function
  Component.validate = function (req) {
    const schema = Joi.object({
      name: Joi.string().required().label("Name"),
      html: Joi.string().required().label("HTML"),
      component_json: Joi.object().required().label("JSON"),
      company_portal_id: Joi.required().label("Company portal"),
    });
    return schema.validate(req.body);
  };
  sequelizePaginate.paginate(Component);

  return Component;
};
