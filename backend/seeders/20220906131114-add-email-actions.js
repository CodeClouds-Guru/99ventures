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
          id: 1,
          action: 'Invitation',
        },
        { id: 2, action: 'Welcome' },
        { id: 3, action: 'Forgot Password' },
        { id: 4, action: 'Account Deactivated' },
        { id: 5, action: 'Withdraw Request Member' },
        { id: 6, action: 'Withdraw Request Admin' },
        { id: 7, action: 'Payment Confirmation' },
        { id: 8, action: 'Contact Us' },
        { id: 9, action: 'Member Profile Completion' },
        { id: 10, action: 'Member Cash Withdrawal' },
        {
          id: 11,
          action: 'Withdrawal Approval',
        },
        {
          id: 12,
          action: 'Transaction Reversed',
        },
        {
          id: 13,
          action: 'Referral Bonus',
        },
        {
          id: 14,
          action: 'Survey Completed',
        },
        {
          id: 15,
          action: 'Registration Bonus',
        },
        {
          id: 16,
          action: 'Membership Level Upgrade',
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
