'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('member_surveys','survey_id')
    await queryInterface.removeColumn('member_surveys','member_id')
    await queryInterface.removeColumn('member_surveys','member_transaction_id')
    await queryInterface.addColumn('member_surveys','survey_number', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('member_surveys', 'survey_provider_id', {
        type: Sequelize.BIGINT,
      }
      );
    await queryInterface.addColumn('member_surveys','original_json', {
        type: Sequelize.JSON
      });
    await queryInterface.addColumn('member_surveys', 'completed_on', {
        type:  'TIMESTAMP',
      });
  },
  async down(queryInterface, Sequelize) {
   // await queryInterface.dropTable('member_surveys');
   await queryInterface.removeColumn('member_surveys','survey_number')
    await queryInterface.removeColumn('member_surveys','survey_provider_id')
    await queryInterface.removeColumn('member_surveys','original_json')
    await queryInterface.removeColumn('member_surveys','completed_on')
  },
};
