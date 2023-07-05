"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("member_balances", "type");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("member_balances");
  },
};
