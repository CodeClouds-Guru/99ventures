'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('withdrawal_requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      member_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
      },
      member_transaction_id: {
        type: Sequelize.BIGINT,
        defaultValue: null,
      },
      amount: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      amount_type: {
        allowNull: false,
        type: Sequelize.ENUM('cash', 'point'),
        defaultValue: 'cash',
      },
      currency: {
        type: Sequelize.STRING,
      },
      withdrawal_type_id: {
        type: Sequelize.BIGINT,
      },
      requested_on: {
        allowNull: false,
        type: Sequelize.TIME,
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('approved', 'pending', 'rejected', 'expired'),
        defaultValue: 'pending',
      },
      transaction_time: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      transaction_made_by: {
        allowNull: false,
        type: Sequelize.BIGINT,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('withdrawal_requests');
  },
};
