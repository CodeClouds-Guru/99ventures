'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SurveyQualification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SurveyQualification.belongsToMany(models.SurveyAnswerPrecodes, {
        through: 'survey_answer_precode_survey_qualifications',
        timestamps: false,
        foreignKey: 'survey_qualification_id',
        otherKey: 'survey_answer_precode_id',
        onDelete: 'CASCADE',
        hooks: true,
      })
    }
  }
  SurveyQualification.init(
    {
      survey_id: DataTypes.BIGINT,
      survey_question_id: DataTypes.BIGINT,
      logical_operator: DataTypes.STRING,
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      deleted_by: DataTypes.BIGINT,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'SurveyQualification',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'survey_qualifications',
    }
  );
  return SurveyQualification;
};
