"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("withdrawal_requests", "status", {
      type: Sequelize.ENUM('approved', 'pending','rejected','expired','completed','declined'),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("withdrawal_requests", "status", {
      type: Sequelize.ENUM('approved', 'pending','rejected','expired'),
    });
  },
};
