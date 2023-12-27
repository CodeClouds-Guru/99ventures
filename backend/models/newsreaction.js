'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NewsReaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      NewsReaction.belongsTo(models.Member, {
        foreignKey: 'id',
        otherKey: 'member_id',
        // as: "credentials",
      });
      NewsReaction.belongsTo(models.News, {
        foreignKey: 'id',
        otherKey: 'news_id',
        // as: "credentials",
      });
    }
  }
  NewsReaction.init(
    {
      news_id: DataTypes.BIGINT,
      member_id: DataTypes.BIGINT,
      reaction: DataTypes.ENUM('0', '1'),
    },
    {
      sequelize,
      modelName: 'NewsReaction',
      timestamps: false,
      // paranoid: true,
      // createdAt: 'created_at', // alias createdAt as created_date
      // updatedAt: 'updated_at',
      // deletedAt: 'deleted_at',
      tableName: 'news_reactions',
    }
  );
  return NewsReaction;
};
