"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("members", "address");
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("members");
  },
};
