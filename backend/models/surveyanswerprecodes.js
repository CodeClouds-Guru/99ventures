'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SurveyAnswerPrecodes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      SurveyAnswerPrecodes.hasMany(models.SurveyQuestion, {
        foreignKey: 'survey_provider_question_id',
        sourceKey: 'precode',
      });

      SurveyAnswerPrecodes.belongsToMany(models.SurveyQualification, {
        through: 'survey_answer_precode_survey_qualifications',
        timestamps: false,
        foreignKey: 'survey_answer_precode_id',
        otherKey: 'survey_qualification_id',
      })
    }
  }
  SurveyAnswerPrecodes.init(
    {
      option: DataTypes.STRING,
      precode: DataTypes.STRING,
      survey_provider_id:  DataTypes.BIGINT,
      country_id: DataTypes.INTEGER,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'SurveyAnswerPrecodes',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'survey_answer_precodes',
    }
  );
  return SurveyAnswerPrecodes;
};
