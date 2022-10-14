"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.changeColumn("members", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "validating",
      comment: "verified, suspended, validating, deleted",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("members");
  },
};
