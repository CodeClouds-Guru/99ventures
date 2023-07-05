'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('withdrawal_requests', 'payment_email', {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {},
};
