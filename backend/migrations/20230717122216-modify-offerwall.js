"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("offer_walls", "description", {
      type: Sequelize.TEXT
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("offer_walls", "description");
  },
};
