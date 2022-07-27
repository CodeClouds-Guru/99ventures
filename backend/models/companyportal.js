'use strict';
const {
  Model
} = require('sequelize');
const sequelizePaginate = require("sequelize-paginate");
module.exports = (sequelize, DataTypes) => {
  class CompanyPortal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CompanyPortal.init({
    company_id: DataTypes.BIGINT,
    domain: DataTypes.STRING,
    name: DataTypes.STRING,
    downtime_message: DataTypes.TEXT,
    status: DataTypes.INTEGER,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: DataTypes.TIME,
    updated_at: DataTypes.TIME,
    deleted_at: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'CompanyPortal',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as created_date
    updatedAt: 'updated_at',
    deletedAt: "deleted_at",
    tableName: "company_portals"
  });
  sequelizePaginate.paginate(CompanyPortal);
  return CompanyPortal;
};