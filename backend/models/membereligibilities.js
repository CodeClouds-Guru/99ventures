'use strict';
const { Model, QueryTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MemberEligibilities extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MemberEligibilities.belongsTo(models.SurveyAnswerPrecodes, {
        foreignKey: 'survey_answer_precode_id'
      });

      // MemberEligibilities.belongsTo(models.SurveyQuestion, {
      //   foreignKey: 'survey_question_id'
      // });

      MemberEligibilities.belongsTo(models.CountrySurveyQuestion, {
        foreignKey: 'country_survey_question_id'
      });

      MemberEligibilities.belongsTo(models.Member, {
        foreignKey: 'member_id',
      });

      

    }
  }
  MemberEligibilities.init(
    {
      member_id: DataTypes.BIGINT,
      survey_question_id: DataTypes.BIGINT,
      survey_answer_precode_id: DataTypes.BIGINT,
      open_ended_value: DataTypes.STRING,
      text: DataTypes.TEXT,
      created_at: 'TIMESTAMP',
      updated_at: 'TIMESTAMP',
      deleted_at: 'TIMESTAMP',
    },
    {
      sequelize,
      modelName: 'MemberEligibilities',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at', // alias createdAt as created_date
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      tableName: 'member_eligibilities',
    }
  );

  MemberEligibilities.getEligibilities = async(country_id, survey_provider_id, member_id) => {
    const query = "SELECT `MemberEligibilities`.`country_survey_question_id`, `MemberEligibilities`.`survey_answer_precode_id`, `MemberEligibilities`.`open_ended_value`, `CountrySurveyQuestion`.`survey_question_id`, `CountrySurveyQuestion`.`survey_provider_question_id`, `SurveyAnswerPrecode`.`option` FROM `member_eligibilities` AS `MemberEligibilities` JOIN( SELECT `CountrySurveyQuestion`.`survey_question_id`, `CountrySurveyQuestion`.`id`, `SurveyQuestion`.`survey_provider_question_id` AS `survey_provider_question_id` FROM `country_survey_question` AS `CountrySurveyQuestion` JOIN `survey_questions` AS `SurveyQuestion` ON `CountrySurveyQuestion`.`survey_question_id` = `SurveyQuestion`.`id` AND( `SurveyQuestion`.`deleted_at` IS NULL AND `SurveyQuestion`.`survey_provider_id` = :survey_provider_id) WHERE `CountrySurveyQuestion`.`country_id` = :country_id AND `CountrySurveyQuestion`.`deleted_at` IS NULL ) AS `CountrySurveyQuestion` ON `MemberEligibilities`.`country_survey_question_id` = `CountrySurveyQuestion`.`id` LEFT JOIN `survey_answer_precodes` AS `SurveyAnswerPrecode` ON `MemberEligibilities`.`survey_answer_precode_id` = `SurveyAnswerPrecode`.`id` AND( `SurveyAnswerPrecode`.`deleted_at` IS NULL AND( `SurveyAnswerPrecode`.`survey_provider_id` = :survey_provider_id AND `SurveyAnswerPrecode`.`country_id` = :country_id ) ) WHERE( `MemberEligibilities`.`deleted_at` IS NULL AND `MemberEligibilities`.`member_id` = :member_id );";

    return await sequelize.query(
        query, 
        { 
            type: QueryTypes.SELECT,
            replacements: { 
                country_id, 
                survey_provider_id, 
                member_id 
            }
        }
    );
  }

  return MemberEligibilities;
};
