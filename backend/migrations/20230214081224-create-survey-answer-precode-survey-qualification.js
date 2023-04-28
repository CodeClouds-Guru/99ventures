'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'survey_answer_precode_survey_qualifications',
      {
        survey_qualification_id: {
          type: Sequelize.BIGINT
        },
        survey_answer_precode_id: {
          type: Sequelize.BIGINT,
        },
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(
      'survey_answer_precode_survey_qualifications'
    );
  },
};
