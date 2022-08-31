'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_action_email_template', {
      email_action_id: {
        type: Sequelize.BIGINT
      },
      email_template_id: {
        type: Sequelize.BIGINT
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('email_action_email_template');
  }
};