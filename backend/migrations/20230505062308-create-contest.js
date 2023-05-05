'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      contest_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '1',
      },
      banner: {
        type: Sequelize.STRING,
      },
      no_of_participant: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      configuration_json: {
        type: Sequelize.JSON,
      },
      payment_type: {
        type: Sequelize.ENUM('automatic', 'manual'),
        defaultValue: 'automatic',
      },
      created_at: {
        type: 'TIMESTAMP',
      },
      updated_at: {
        type: 'TIMESTAMP',
      },
      created_by: {
        type: Sequelize.BIGINT,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contests');
  },
};
