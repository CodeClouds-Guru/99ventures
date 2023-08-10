'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'member_eligibilities',
      'country_survey_question_id',
      {
        type: Sequelize.BIGINT,
      }
    );
    await queryInterface.removeColumn(
      'member_eligibilities',
      'survey_question_id'
    );
    await queryInterface.addIndex('member_eligibilities', {
      fields: ['member_id', 'country_survey_question_id'],
      unique: true,
      // name: 'member_survey',
    });
  },
  async down(queryInterface, Sequelize) {
    // await queryInterface.removeColumn(
    //   'member_eligibilities',
    //   'country_survey_question_id'
    // );
    // await queryInterface.removeIndex('member_eligibilities', 'member_id');
  },
};
