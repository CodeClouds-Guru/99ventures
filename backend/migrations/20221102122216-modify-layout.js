"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("layouts", "html", {
      type: Sequelize.TEXT('long')
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("layouts");
  },
};
