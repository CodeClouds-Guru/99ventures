'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     **/
    await queryInterface.bulkInsert(
      'email_actions',
      [
        {
          action: 'Invitation',
        },
        {
          action: 'Welcome',
        },
        {
          action: 'Forgot Password',
        },
        {
          action: 'Account Deactivated',
        },
        {
          action: 'Withdraw Request',
        },
        {
          action: 'Payment Confirmation',
        },
        {
          action: 'Contact Us',
        },
        {
          action: 'Member Profile Completion',
        },
        {
          action: 'Member Cash Withdrawal',
        },
        {
          action: 'Withdrawal Approval',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('email_actions', null, {});
  },
};
