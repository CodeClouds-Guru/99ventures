'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'survey_answer_precodes',
      'survey_provider_id',
      {
        type: Sequelize.STRING,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'survey_answer_precodes',
      'survey_provider_id'
    );
  },
};
