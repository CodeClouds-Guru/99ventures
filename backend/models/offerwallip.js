'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OfferWallIp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OfferWallIp.init(
    {
      ip: DataTypes.STRING,
      offer_wall_id: DataTypes.BIGINT,
      status: DataTypes.ENUM(0, 1),
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'OfferWallIp',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'offer_wall_ips',
    }
  );
  return OfferWallIp;
};
