'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'membershiptier_rules',
      'membershiptier_id'
    );
    await queryInterface.addColumn(
      'membershiptier_rules',
      'membership_tier_id',
      {
        type: Sequelize.BIGINT,
        allowNull: true,
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'membershiptier_rules',
      'membership_tier_id'
    );
  },
};
