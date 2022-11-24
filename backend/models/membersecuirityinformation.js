'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MemberSecuirityInformation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MemberSecuirityInformation.init({
    member_id: DataTypes.BIGINT,
    geo_location: DataTypes.STRING,
    ip: DataTypes.STRING,
    isp: DataTypes.STRING,
    browser: DataTypes.STRING,
    browser_language: DataTypes.STRING,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: "TIMESTAMP",
    updated_at: "TIMESTAMP",
    deleted_at: "TIMESTAMP",
  }, {
    sequelize,
    modelName: 'MemberSecuirityInformation',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at", // alias createdAt as created_date
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "members",
  });
  
  return MemberSecuirityInformation;
};