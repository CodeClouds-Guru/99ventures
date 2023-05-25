'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('member_transactions', 'status', {
      type: Sequelize.TINYINT,
      comment:
        '0=initiated, 1=processing, 2=completed, 3=failed, 4=declined, 5=reverted',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('member_transactions', 'status');
  },
};
