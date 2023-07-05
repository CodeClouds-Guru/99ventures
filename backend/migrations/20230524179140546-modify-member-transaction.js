'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('member_transactions', 'status', {
      type: Sequelize.TINYINT,
      comment:
        '0=initiated, 1=processing, 2=completed, 3=failed, 4=declined, 5=reverted',
    });
    await queryInterface.changeColumn('member_transactions', 'amount_action', {
      type: Sequelize.ENUM(
        'admin_adjustment',
        'survey',
        'referral',
        'member_withdrawal',
        'registration_bonus',
        'reversed_transaction'
      ),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('member_transactions', 'status', {
      type: Sequelize.TINYINT,
      comment: '0=initiated, 1=processing, 2=completed, 3=failed, 4=declined',
    });
    await queryInterface.changeColumn('member_transactions', 'amount_action', {
      type: Sequelize.ENUM(
        'admin_adjustment',
        'survey',
        'referral',
        'member_withdrawal',
        'registration_bonus'
      ),
    });
  },
};
