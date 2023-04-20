'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     **/
    await queryInterface.bulkInsert(
      'shoutbox_configurations',
      [
        {
          company_portal_id: 1,
          event_name: 'Survey and Offer completions',
          verbose:'${members.first_name} just earned ${amount} with ${surveys.name}',
          event_slug: 'survey-and-offer-completions',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 1,
          event_name: 'Promo code redemption',
          verbose:
            '${members.first_name} just redeemed a promo code.',
          event_slug: 'promo-code-redemption',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 1,
          event_name: 'Contest winners',
          verbose:
            '${members.first_name} won ${amount} in the ${contests.name} contest',
          event_slug: 'contest-winners',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 1,
          event_name: 'Withdrawal requests',
          verbose:
            '${members.first_name} - we have received your withdrawal request for ${withdrawal_requests.amount}',
          event_slug: 'withdrawal-requests',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 2,
          event_name: 'Survey and Offer completions',
          verbose:
            '${members.first_name} just earned ${amount} with ${surveys.name}',
          event_slug: 'survey-and-offer-completions',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 2,
          event_name: 'Promo code redemption',
          verbose:
            '${members.first_name} just redeemed a promo code.',
          event_slug: 'promo-code-redemption',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 2,
          event_name: 'Contest winners',
          verbose:
            '${members.first_name} won ${amount} in the ${contests.name} contest',
          event_slug: 'contest-winners',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 2,
          event_name: 'Withdrawal requests',
          verbose:
            '${members.first_name} - we have received your withdrawal request for ${withdrawal_requests.amount}',
          event_slug: 'withdrawal-requests',
          status: 1,
          created_at: new Date(),
          created_by: 1,
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
    await queryInterface.bulkDelete('shoutbox_configurations', null, {});
  },
};
