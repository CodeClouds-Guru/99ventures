'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'withdrawal_requests',
      'amount',
      {
        type: Sequelize.DECIMAL(10, 2),
      }
    );
  },

  async down(queryInterface, Sequelize) {},
};
