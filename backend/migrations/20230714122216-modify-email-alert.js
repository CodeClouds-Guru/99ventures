"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("email_alerts", "description", {
      type: Sequelize.TEXT('long')
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("email_alerts", "description")
  },
};
