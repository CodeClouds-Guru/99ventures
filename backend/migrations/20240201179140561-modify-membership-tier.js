'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('membership_tiers', 'send_email', {
      type: Sequelize.TINYINT,
      defaultValue: 0,
    });
    await queryInterface.addColumn('membership_tiers', 'mime_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('membership_tiers', 'send_email');
    await queryInterface.removeColumn('membership_tiers', 'mime_type');
  },
};
