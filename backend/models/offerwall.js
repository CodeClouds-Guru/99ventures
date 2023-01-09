'use strict';
const {
  Model
} = require('sequelize');
const sequelizePaginate = require("sequelize-paginate");
const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  class OfferWall extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OfferWall.init({
    company_portal_id: DataTypes.BIGINT,
    premium_configuration: DataTypes.ENUM("Custom", "Automatic"),
    name: DataTypes.STRING,
    sub_id_prefix: DataTypes.STRING,
    log_postback_erros: DataTypes.INTEGER,
    secure_sub_ids: DataTypes.INTEGER,
    status: DataTypes.ENUM('Enabled', 'Disabled'),
    mode: DataTypes.ENUM('Reward Tool', 'PostBack'),
    allow_from_any_ip: DataTypes.INTEGER,
    campaign_id_variable: DataTypes.STRING,
    campaign_name_variable: DataTypes.STRING,
    sub_id_variable: DataTypes.STRING,
    reverse_variable: DataTypes.STRING,
    reverse_value: DataTypes.STRING,
    response_ok: DataTypes.STRING,
    response_fail: DataTypes.STRING,
    currency_variable: DataTypes.STRING,
    currency_options: DataTypes.ENUM('Cash', 'Points'),
    currency_percent: DataTypes.STRING,
    currency_max: DataTypes.STRING,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT,
    created_at: "TIMESTAMP",
    updated_at: "TIMESTAMP",
    deleted_at: "TIMESTAMP",

  }, {
    sequelize,
    modelName: 'OfferWall',
    timestamps: true,
    paranoid: true,
    createdAt: "created_at", // alias createdAt as created_date
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    tableName: "offer_walls",
  });
  return OfferWall;
};