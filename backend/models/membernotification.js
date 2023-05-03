'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MemberNotification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MemberNotification.init(
    {
      member_id: DataTypes.BIGINT,
      verbose: DataTypes.STRING,
      action: DataTypes.STRING,
      is_read: DataTypes.ENUM(0, 1),
      read_on: 'TIMESTAMP',
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'MemberNotification',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'member_notifications',
    }
  );
  return MemberNotification;
};
