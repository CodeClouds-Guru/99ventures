'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('members', 'membership_tier_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('members', 'membership_tier_id', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
  },
};
