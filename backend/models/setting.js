"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Setting.init(
    {
      company_portal_id: DataTypes.BIGINT,
      settings_key: {
        type: DataTypes.STRING,
        unique: {
          args: true,
          msg: "Key already in use!",
        },
      },
      settings_value: {
        type: DataTypes.TEXT,
        get() {
          return JSON.parse(this.getDataValue("settings_value")) || "";
        },
        set(value) {
          // Storing passwords in plaintext in the database is terrible.
          // Hashing the value with an appropriate cryptographic hash function is better.
          console.log(typeof value );
          if (typeof value !== "string")
            this.setDataValue("settings_value", JSON.stringify(value));
          else this.setDataValue("settings_value", value);
        },
      },
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: "TIMESTAMP",
      updated_at: "TIMESTAMP",
      deleted_at: "TIMESTAMP",
    },
    {
      sequelize,
      modelName: "Setting",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at", // alias createdAt as created_date
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "settings",
    }
  );
  return Setting;
};
