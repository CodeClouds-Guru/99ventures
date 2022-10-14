"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TicketConversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TicketConversation.hasMany(models.TicketAttachment, {
        foreignKey: "ticket_conversation_id",
      });
      TicketConversation.belongsTo(models.Member, {
        foreignKey: "member_id",
        // as: "username",
      });
      TicketConversation.belongsTo(models.User, {
        foreignKey: "user_id",
        // as: "username",
      });
    }
  }
  TicketConversation.init(
    {
      ticket_id: DataTypes.BIGINT,
      member_id: DataTypes.BIGINT,
      message: DataTypes.TEXT,
      user_id: DataTypes.BIGINT,
      created_at: "TIMESTAMP",
      updated_at: "TIMESTAMP",
      deleted_at: "TIMESTAMP",
    },
    {
      sequelize,
      modelName: "TicketConversation",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at", // alias createdAt as created_date
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "ticket_conversations",
    }
  );
  return TicketConversation;
};
