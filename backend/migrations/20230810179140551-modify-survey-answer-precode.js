'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.addColumn('survey_answer_precodes', 'country_id', {
    //   type: Sequelize.BIGINT,
    // });
    // await queryInterface.removeIndex('survey_answer_precodes', 'option');
    await queryInterface.addIndex('survey_answer_precodes', {
      fields: ['option', 'precode', 'survey_provider_id', 'country_id'],
      unique: true,
      name: 'option',
    });
  },
  async down(queryInterface, Sequelize) {
    // await queryInterface.removeColumn('survey_answer_precodes', 'country_id');
    // await queryInterface.removeIndex('survey_answer_precodes', [
    //   'option',
    //   'precode',
    //   'survey_provider_id',
    //   'country_id',
    // ]);
  },
};
