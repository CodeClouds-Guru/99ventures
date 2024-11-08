'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'members',
      'admin_status',
      {
        type: Sequelize.ENUM('not_verified', 'verified', 'pending'),
        defaultValue:'not_verified'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'members',
      'admin_status'
    );
  },
};
