"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("members", "status", {
      type: Sequelize.STRING,
      comment: "member, suspended, validating, deleted",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("members");
  },
};
