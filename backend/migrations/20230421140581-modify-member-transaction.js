'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('member_transactions', 'amount_action', {
      type: Sequelize.ENUM(
        'admin_adjustment',
        'survey',
        'referral',
        'member_withdrawal'
      ),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('member_transactions');
  },
};
