'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ticket_conversations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      ticket_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      member_id: {
        type: Sequelize.BIGINT,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
        charset: 'utf8mb4',
      },
      user_id: {
        type: Sequelize.BIGINT,
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
    },{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ticket_conversations');
  }
};