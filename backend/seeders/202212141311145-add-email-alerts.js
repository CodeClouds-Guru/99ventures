'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     **/
    await queryInterface.bulkInsert(
      'email_alerts',
      [
        {
          name: 'Completed Rewards',
          slug: 'completed_rewards',
        },
        {
          name: 'Completed Withdraw',
          slug: 'completed_withdraw',
        },
        {
          name: 'Notifications',
          slug: 'notifications',
        },
        {
          name: 'Referrals',
          slug: 'referrals',
        },
        {
          name: 'Email Marketting',
          slug: 'email_marketting',
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
  },
};
