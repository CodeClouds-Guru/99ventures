'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('survey_answer_precodes', 'country_id', {
      type: Sequelize.INTEGER,
      defaultValue: '226',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('survey_answer_precodes', 'country_id');
  },
};
