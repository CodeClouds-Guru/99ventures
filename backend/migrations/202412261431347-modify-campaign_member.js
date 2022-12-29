"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("campaign_member", "track_id", {
      type: Sequelize.STRING,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("campaign_member");
  },
};
