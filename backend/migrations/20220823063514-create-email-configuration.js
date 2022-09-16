'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_configurations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      from_name: {
        type: Sequelize.STRING
      },
      from_email: {
        type: Sequelize.STRING
      },
      email_username: {
        type: Sequelize.STRING
      },
      email_server_host: {
        type: Sequelize.STRING
      },
      email_server_port: {
        type: Sequelize.STRING
      },
      ssl_required: {
        type: Sequelize.TINYINT
      },
      site_name_visible: {
        type: Sequelize.TINYINT
      },
      site_name_text: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      company_portal_id: {
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
    await queryInterface.dropTable('email_configurations');
  }
};