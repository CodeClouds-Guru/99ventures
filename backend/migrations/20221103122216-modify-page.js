"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("pages", "layout_id", {
      type: Sequelize.BIGINT
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("pages");
  },
};
