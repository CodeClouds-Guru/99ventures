"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("pages", "keywords", {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn("pages", "descriptions", {
      type: Sequelize.TEXT('long'),
    });
    await queryInterface.addColumn("pages", "meta_code", {
      type: Sequelize.TEXT('long'),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("pages");
  },
};
