'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_member_payment_method_approvals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      member_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      payment_method_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      is_used: {
        type: Sequelize.TINYINT,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('approved', 'pending', 'rejected', 'expired'),
        allowNull: true,
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
      created_by: {
        type: Sequelize.BIGINT,
      },
      updated_by: {
        type: Sequelize.BIGINT,
      },
      deleted_by: {
        type: Sequelize.BIGINT,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('admin_member_payment_method_approvals');
  },
};
