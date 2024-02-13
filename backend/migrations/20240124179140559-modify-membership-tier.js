'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('membership_tiers', 'chronology', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('membership_tiers', 'chronology');
  },
};
