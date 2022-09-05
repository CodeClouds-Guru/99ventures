"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmailActionEmailTemplate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmailActionEmailTemplate.init(
    {
        email_action_id: DataTypes.BIGINT,
        email_template_id: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "EmailActionEmailTemplate",
      timestamps: false,
      paranoid: false,
      tableName:"email_action_email_template",
      createdAt: false,
      updatedAt: false,
    }
  );
  return EmailActionEmailTemplate;
};
