'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SurveyQuestion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SurveyQuestion.hasMany(models.SurveyAnswerPrecodes, {
        foreignKey: 'precode',
        otherKey: 'survey_provider_question_id',
      });

      SurveyQuestion.hasOne(models.CountrySurveyQuestion, {
        foreignKey: 'survey_question_id',
      });
    }
  }
  SurveyQuestion.init(
    {
      question_text: DataTypes.STRING,
      name: DataTypes.STRING,
      survey_provider_id: DataTypes.BIGINT,
      survey_provider_question_id: DataTypes.BIGINT,
      question_type: DataTypes.STRING,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'SurveyQuestion',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'survey_questions',
    }
  );
  return SurveyQuestion;
};
