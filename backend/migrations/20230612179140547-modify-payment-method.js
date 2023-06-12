'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'payment_methods',
      'withdraw_redo_interval',
      {
        type: Sequelize.FLOAT,
        allowNull: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'payment_methods',
      'withdraw_redo_interval',
      {
        type: Sequelize.FLOAT,
        allowNull: false,
      }
    );
  },
};
