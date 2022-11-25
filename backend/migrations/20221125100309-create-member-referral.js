'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('member_referrals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      member_id: {
        type: Sequelize.BIGINT
      },
      referral_id: {
        type: Sequelize.BIGINT
      },
      referral_email: {
        type: Sequelize.STRING
      },
      geo_location: {
        type: Sequelize.STRING
      },
      ip: {
        type: Sequelize.STRING
      },
      join_date: {
        type: "TIMESTAMP",
      },
      activity_date: {
        type: "TIMESTAMP",
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.dropTable('member_referrals');
  }
};