"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("member_referrals", "referral_id", {
      type: Sequelize.BIGINT,
      comment: 'It will store member id who has been referred',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("members");
  },
};
