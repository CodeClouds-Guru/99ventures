'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('member_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      member_payment_information_id: {
        type: Sequelize.BIGINT
      },
      type: {
        type: Sequelize.ENUM('credited', 'withdraw'),
        defaultValue:'credited'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
      },
      balance: {
        type: Sequelize.DECIMAL(10, 2),
      },
      completed_at: {
        type: "TIMESTAMP",
        allowNull: false,
      },
      transaction_id:{
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.TINYINT,
        comment: "0=initiated, 1=processing, 2=completed, 3=failed, 4=declined"
      },
      note:{
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
        type: "TIMESTAMP",
        allowNull: false,
      },
      updated_at: {
        type: "TIMESTAMP",
      },
      deleted_at: {
        type: "TIMESTAMP",
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('member_transactions');
  }
};