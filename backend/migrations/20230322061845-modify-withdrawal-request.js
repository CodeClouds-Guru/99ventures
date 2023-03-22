'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('withdrawal_requests', 'note', {
      type: Sequelize.TEXT,
      defaultValue: null,
    });
    await queryInterface.changeColumn(
      'withdrawal_requests',
      'transaction_made_by',
      {
        type: Sequelize.BIGINT,
        defaultValue: null,
      }
    );
    await queryInterface.changeColumn('withdrawal_requests', 'requested_on', {
      type: Sequelize.DATE,
      defaultValue: null,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('withdrawal_requests');
  },
};
