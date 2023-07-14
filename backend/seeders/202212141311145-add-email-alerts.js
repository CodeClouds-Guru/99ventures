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
          description:'Yes, please send an email when I have been successfully credited for a survey/offer.'
        },
        {
          name: 'Completed Withdraw',
          slug: 'completed_withdraw',
          description:'Yes, please send an email when my withdrawal has been approved.'
        },
        {
          name: 'Notifications',
          slug: 'notifications',
          description:' Yes, please send an email when I receive an account notification.'
        },
        {
          name: 'Referrals',
          slug: 'referrals',
          description:'Yes, please send an email for each new referral I receive.'
        },
        {
          name: 'Email Marketing',
          slug: 'email_marketting',
          description:'Yes, please send an e-mail when my reward is approved and processed.'
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
    await queryInterface.bulkDelete('email_alerts', null, {truncate: true,cascade: true});
  },
};
