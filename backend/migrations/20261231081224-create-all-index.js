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

  },
  async down(queryInterface, Sequelize) {
    
  },
};
