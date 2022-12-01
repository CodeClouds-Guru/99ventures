"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("member_transactions", "amount_action", {
      type: Sequelize.ENUM('admin_adjustment', 'survey', 'referral'),
    });
    await queryInterface.addColumn("member_transactions", "currency", {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("member_transactions");
  },
};
