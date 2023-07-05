"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("pages", "html", {
      type: Sequelize.TEXT('long'),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("pages");
  },
};
