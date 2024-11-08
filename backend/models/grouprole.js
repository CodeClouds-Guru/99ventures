'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class GroupRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GroupRole.init(
    {
      group_id: DataTypes.BIGINT,
      role_id: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: 'GroupRole',
      timestamps: false,
      paranoid: false,
      tableName: 'group_role',
      createdAt: false,
      updatedAt: false,
    }
  )
  return GroupRole
}
