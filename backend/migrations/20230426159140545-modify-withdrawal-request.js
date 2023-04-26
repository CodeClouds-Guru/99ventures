'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'withdrawal_requests',
      'transaction_time',
      {
        type: 'TIMESTAMP',
      }
    );
    await queryInterface.changeColumn('withdrawal_requests', 'created_at', {
      type: 'TIMESTAMP',
    });
    await queryInterface.changeColumn('withdrawal_requests', 'updated_at', {
      type: 'TIMESTAMP',
    });
    await queryInterface.changeColumn('withdrawal_requests', 'requested_on', {
      type: 'TIMESTAMP',
    });
  },

  async down(queryInterface, Sequelize) {},
};
