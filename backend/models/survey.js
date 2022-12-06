'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Survey extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Survey.belongsTo(models.SurveyProvider, {
        foreignKey: 'survey_provider_id',
      })
    }
  }
  Survey.init({
    survey_provider_id: DataTypes.BIGINT,
    ioi: DataTypes.FLOAT,
    payout: DataTypes.FLOAT,
    convertion_rate: DataTypes.FLOAT,
    score: DataTypes.FLOAT,
    statistic_rating_count: DataTypes.FLOAT,
    statistic_rating_avg: DataTypes.FLOAT,
    type: DataTypes.STRING,
    payout_publisher_usd: DataTypes.FLOAT,
    href: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Survey',
    tableName: 'surveys',
  });
  return Survey;
};