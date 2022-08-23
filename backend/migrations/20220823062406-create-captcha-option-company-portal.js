'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('captcha_option_company_portal', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_portal_id: {
        type: Sequelize.BIGINT
      },
      captcha_option_id: {
        type: Sequelize.BIGINT
      },
      created_by: {
        type: Sequelize.BIGINT
      },
      updated_by: {
        type: Sequelize.BIGINT
      },
      deleted_by: {
        type: Sequelize.BIGINT
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