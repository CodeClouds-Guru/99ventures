'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('isp_configurations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_portal_id: {
        type: Sequelize.BIGINT
      },
      isp: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('isp_configurations');
  }
};