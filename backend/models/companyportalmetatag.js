"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CompanyPortalMetaTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CompanyPortalMetaTag.init(
    {
      company_portal_id: DataTypes.BIGINT,
      tag_name: DataTypes.STRING,
      tag_content: {
        type: DataTypes.TEXT,
        get() {
          return this.getDataValue("tag_content") || "";
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
      modelName: "CompanyPortalMetaTag",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at", // alias createdAt as created_date
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "company_portal_meta_tags",
    }
  );
  return CompanyPortalMetaTag;
};
