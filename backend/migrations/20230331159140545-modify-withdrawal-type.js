'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('withdrawal_types', 'payment_method_id', {
      type: Sequelize.BIGINT,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropColumn('withdrawal_types', 'payment_method_id', {
      type: Sequelize.BIGINT,
    });
  },
};
