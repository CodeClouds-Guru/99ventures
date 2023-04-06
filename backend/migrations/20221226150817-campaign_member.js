'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("campaign_member", {
      
      member_id: {
        type: Sequelize.BIGINT,
      },
      campaign_id: {
        type: Sequelize.BIGINT,
      },
      track_id: {
        type: Sequelize.BIGINT,
      },
      is_condition_met: {
        type: Sequelize.TINYINT,
      },
      is_postback_triggered: {
        type: Sequelize.TINYINT,
      },
      is_reversed: {
        type: Sequelize.TINYINT,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
