"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PermissionRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PermissionRole.init(
    {
      permission_id: DataTypes.BIGINT,
      role_id: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "PermissionRole",
      timestamps: false,
      tableName:"permission_role"
    }
  );
  return PermissionRole;
};
