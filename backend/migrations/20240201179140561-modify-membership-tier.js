'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('membership_tiers', 'send_email', {
      type: Sequelize.TINYINT,
      defaultValue: 0,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('membership_tiers', 'send_email');
  },
};
