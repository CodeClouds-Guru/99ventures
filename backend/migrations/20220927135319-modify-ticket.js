"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.changeColumn("tickets", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "pending",
      comment: "open, pending, closed",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tickets");
  },
};
