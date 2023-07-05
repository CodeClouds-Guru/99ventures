'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tickets', {
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
      member_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.TINYINT,
        defaultValue: 1,
        comment: "1=open,2=pending,0=closed"
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