"use strict";
const { Model } = require("sequelize");
const sequelizePaginate = require("sequelize-paginate");

module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ticket.belongsTo(models.Member, {
        foreignKey: "member_id",
        // as: "username",
      });
      Ticket.hasMany(models.TicketConversation, {
        foreignKey: "ticket_id",
      });
    }
  }
  Ticket.init(
    {
      company_portal_id: DataTypes.BIGINT,
      member_id: DataTypes.BIGINT,
      subject: DataTypes.STRING,
      status: DataTypes.TINYINT,
      is_read: DataTypes.TINYINT,
      created_at: "TIMESTAMP",
      updated_at: "TIMESTAMP",
      deleted_at: "TIMESTAMP",
    },
    {
      sequelize,
      modelName: "Ticket",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at", // alias createdAt as created_date
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "tickets",
    }
  );
  Ticket.extra_fields = ["username"];
  Ticket.fields = {
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
      placeholder: "company_portal_id",
      listing: false,
      show_in_form: false,
      sort: true,
      required: true,
      value: "",
      width: "50",
      searchable: false,
    },
    member_id: {
      field_name: "member_id",
      db_name: "member_id",
      type: "text",
      placeholder: "Member ID",
      listing: false,
      show_in_form: false,
      sort: true,
      required: false,
      value: "",
      width: "50",
      searchable: true,
    },
    subject: {
      field_name: "subject",
      db_name: "subject",
      type: "text",
      placeholder: "Subject",
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
      searchable: false,
    },
  };
  sequelizePaginate.paginate(Ticket);

  Ticket.getTicketCount = async (read, company_portal_id) => {
    let result = await Ticket.findAndCountAll({
      where: { is_read: read, company_portal_id: company_portal_id },
    });
    return result.count;
  };

  Ticket.changeIsReadStatus = async (field_name, val, ticket_id) => {
    let update_data = {
      [field_name]: val,
    };
    console.log(update_data);
    let result = await Ticket.update(update_data, {
      where: { id: ticket_id },
      return:true
    });
    return result[0];
  };

  return Ticket;
};
