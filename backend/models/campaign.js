'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Campaign extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Campaign.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    affiliate_network: DataTypes.STRING,
    payout_amount: DataTypes.FLOAT,
    trigger_postback: DataTypes.STRING,
    postback_url: DataTypes.STRING,
    track_id: DataTypes.STRING,
    condition_type: DataTypes.STRING,
    condition_currency: DataTypes.STRING,
    condition_amount: DataTypes.FLOAT,
    status: DataTypes.STRING,
    created_at: DataTypes.TIME,
    updated_at: DataTypes.TIME,
    deleted_at: DataTypes.TIME,
    created_by: DataTypes.BIGINT,
    updated_by: DataTypes.BIGINT,
    deleted_by: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'Campaign',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at', // alias createdAt as 
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    tableName: 'campaigns',
  });
  return Campaign;
};