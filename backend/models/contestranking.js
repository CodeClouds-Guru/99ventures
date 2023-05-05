'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ContestRanking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ContestRanking.init({
    contest_leaderboard_id: DataTypes.BIGINT,
    member_id: DataTypes.BIGINT,
    rank: DataTypes.INTEGER,
    earning: DataTypes.FLOAT,
    credited_on: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ContestRanking',
  });
  return ContestRanking;
};