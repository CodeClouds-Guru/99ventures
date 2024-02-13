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
          created_at: new Date(),
        },
        {
          name: 'Email Verified',
          variable: 'email_verified',
          created_at: new Date(),
        },
        {
          name: 'Profile Completed',
          variable: 'profile_completed',
          created_at: new Date(),
        },
        {
          name: 'Successful Withdrawals',
          variable: 'withdrawal_count',
          created_at: new Date(),
        },
        {
          name: 'Withdrawn Amount',
          variable: 'withdrawn_amount',
          created_at: new Date(),
        },
        {
          name: 'Number Of Days Registered',
          variable: 'registered_days',
          created_at: new Date(),
        },
        {
          name: 'Phone Number Verified',
          variable: 'phone_no_verified_on',
          created_at: new Date(),
        },
        {
          name: 'Number Of Surveys Completed',
          variable: 'number_of_surveys_completed',
          created_at: new Date(),
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
