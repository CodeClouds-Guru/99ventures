"use strict";
const { Model } = require("sequelize");
const FileHelper = require("../helpers/fileHelper");

module.exports = (sequelize, DataTypes) => {
  class TicketAttachment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TicketAttachment.init(
    {
      ticket_conversation_id: DataTypes.BIGINT,
      file_name: {
        type: DataTypes.STRING,
        get() {
          let rawValue = this.getDataValue("file_name");
          const publicURL =
            process.env.CLIENT_API_PUBLIC_URL || "http://127.0.0.1:4000";
          if (rawValue) {
            const fileHelper = new FileHelper([], "tickets");
            const file_name = fileHelper.generateSignedUrl(rawValue);
            rawValue = file_name;
          }
          return rawValue ? rawValue : `${publicURL}/images/demo-user.png`;
        },
      },
      mime_type: DataTypes.STRING,
      created_at: "TIMESTAMP",
      updated_at: "TIMESTAMP",
      deleted_at: "TIMESTAMP",
    },
    {
      sequelize,
      modelName: "TicketAttachment",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at", // alias createdAt as created_date
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "ticket_attachments",
    }
  );
  return TicketAttachment;
};
