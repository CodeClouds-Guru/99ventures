"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("campaigns", "company_portal_id", {
      type: Sequelize.BIGINT,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("campaigns");
  },
};
