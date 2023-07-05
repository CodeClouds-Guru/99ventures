"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("member_transactions", "balance", {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue:0.00
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("member_transactions");
  },
};
