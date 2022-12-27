'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('member_balances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      member_id: {
        type: Sequelize.BIGINT
      },
      type: {
        type: Sequelize.ENUM('admin_adjustment', 'survey', 'referral'),
        defaultValue:'admin_adjustment'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue:0.00
      },
      amount_type: {
        type: Sequelize.ENUM('cash', 'point'),
        defaultValue:'cash'
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
    await queryInterface.dropTable('member_balances');
  }
};