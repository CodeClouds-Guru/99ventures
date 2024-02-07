'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('membership_tiers', 'color', {
      type: Sequelize.STRING(255),
      defaultValue: '#FFFFFF',
    });
    await queryInterface.addColumn('membership_tiers', 'description', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('membership_tiers', 'color');
    await queryInterface.removeColumn('membership_tiers', 'description');
  },
};
