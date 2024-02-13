'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('member_surveys', {
      fields: ['member_transaction_id', 'survey_number', 'survey_provider_id'],
      unique: true,
      name: 'transaction_survey_number_provider',
    });
  },
  async down(queryInterface, Sequelize) {
    // await queryInterface.removeIndex(
    //   'member_survey',
    //   'survey_number_member_id_survey_provider_id'
    // );
  },
};
