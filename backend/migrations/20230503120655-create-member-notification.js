'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('member_notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      member_id: {
        type: Sequelize.BIGINT,
      },
      verbose: {
        type: Sequelize.STRING,
      },
      action: {
        type: Sequelize.STRING,
      },
      is_read: {
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '1',
      },
      read_on: {
        type: 'TIMESTAMP',
      },
      created_at: {
        type: 'TIMESTAMP',
      },
      updated_at: {
        type: 'TIMESTAMP',
      },
      deleted_at: {
        type: 'TIMESTAMP',
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('member_notifications');
  },
};
