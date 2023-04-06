"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("campaign_member", "created_at", {
      type: 'TIMESTAMP',
      defaultValue:new Date()
    });
    await queryInterface.addColumn("campaign_member", "created_by", {
      type: Sequelize.BIGINT,
    });
    await queryInterface.addColumn("campaign_member", "updated_at", {
      type: 'TIMESTAMP',
    });
    await queryInterface.addColumn("campaign_member", "updated_by", {
      type: Sequelize.BIGINT,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("campaign_member");
  },
};
