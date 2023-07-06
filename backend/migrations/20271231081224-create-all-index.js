'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("survey_questions",{
      fields: ['survey_provider_id', 'survey_provider_question_id'],
      unique: true,
    });
    await queryInterface.addIndex("survey_answer_precodes",{
      fields: ['option', 'precode'],
      unique: true,
    });
    await queryInterface.addIndex("member_eligibilities",{
      fields: ['member_id', 'survey_question_id'],
      unique: true,
    });

  },
  async down(queryInterface, Sequelize) {
    //await queryInterface.removeIndex('survey_questions', '`survey_questions_survey_provider_id_survey_provider_question_id`');
    //await queryInterface.removeIndex('survey_answer_precodes', '`survey_answer_precodes_option_precode`');
    // await queryInterface.removeIndex('member_eligibilities', 'member_eligibilities_member_id_survey_question_id');
  },
};