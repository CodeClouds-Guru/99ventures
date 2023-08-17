'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CountrySurveyQuestion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here      
      
      CountrySurveyQuestion.belongsTo(models.SurveyQuestion, {
        foreignKey: 'survey_question_id'
      });
    }
  }
  CountrySurveyQuestion.init(
    {
        country_id: DataTypes.BIGINT,
        survey_question_id: DataTypes.BIGINT,
        created_at: 'TIMESTAMP',
        updated_at: 'TIMESTAMP',
        deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'CountrySurveyQuestion',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'country_survey_question',
    }
  );
  return CountrySurveyQuestion;
};
