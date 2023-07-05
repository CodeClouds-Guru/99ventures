"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("members", "referer");
    await queryInterface.addColumn("members", "member_referral_id", {
      type: Sequelize.BIGINT,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("members");
  },
};
