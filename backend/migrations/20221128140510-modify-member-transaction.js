"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("member_transactions", "member_id", {
      type: Sequelize.BIGINT,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("member_transactions");
  },
};
