"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("members", "username", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("members");
  },
};
