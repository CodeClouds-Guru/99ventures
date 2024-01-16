'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Rule.hasMany(models.MemberShipTierAction, {
        foreignKey: 'membership_tier_action_id',
      });
    }
  }
  Rule.init(
    {
      membership_tier_action_id: DataTypes.BIGINT,
      operator: DataTypes.STRING,
      value: DataTypes.STRING,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'Rule',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'rules',
    }
  );
  return Rule;
};
