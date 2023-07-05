'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'member_transactions',
      'parent_transaction_id',
      {
        type: Sequelize.BIGINT,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'member_transactions',
      'parent_transaction_id'
    );
  },
};
