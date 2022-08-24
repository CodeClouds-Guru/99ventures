'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tickets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_portal_id_id: {
        type: Sequelize.BIGINT
      },
      member_id: {
        type: Sequelize.BIGINT
      },
      subject: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('tickets');
  }
};