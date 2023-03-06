'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('captcha_option_company_portal', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      company_portal_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      captcha_option_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      created_at: {
        type: 'TIMESTAMP',
        allowNull: false,
      },
      updated_at: {
        type: 'TIMESTAMP'
      },
      deleted_at: {
        type: 'TIMESTAMP'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('captcha_option_company_portal');
  }
};