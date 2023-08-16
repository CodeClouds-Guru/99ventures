'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('survey_answer_precodes', 'option_text', {
      type: Sequelize.TEXT,
      collate: 'utf8mb4_general_ci'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('survey_answer_precodes', 'option_text');
  },
};
