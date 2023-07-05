'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SurveyPostback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SurveyPostback.init({
    survey_id: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'SurveyPostback',
    tableName: 'survey_postbacks',
  });
  return SurveyPostback;
};