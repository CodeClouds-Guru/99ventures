'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     **/
    await queryInterface.bulkInsert(
      'membership_tier_actions',
      [
        {
          name: 'Signup',
          variable: 'signup',
        },
        {
          name: 'Email Verified',
          variable: 'email_verified',
        },
        {
          name: 'Profile Completed',
          variable: 'profile_completed',
        },
        {
          name: 'Successful Withdrawals',
          variable: 'withdrawal_count',
        },
        {
          name: 'Withdrawn Amount',
          variable: 'withdrawn_amount',
        },
        {
          name: 'Number Of Days Registered',
          variable: 'registered_days',
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
    await queryInterface.bulkDelete('membership_tier_actions', null, {
      truncate: true,
      cascade: true,
    });
  },
};
