'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('payment_methods', 'logo');
  },

  async down(queryInterface, Sequelize) {},
};
