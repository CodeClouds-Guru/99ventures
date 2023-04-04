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
          verbose:
            'Credit amount, username and the survey name would be included.EG. %username% just earned %amount% with %survey supplier%',
          event_slug: 'survey-and-offer-completions',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 1,
          event_name: 'Promo code redemption',
          verbose:
            'Only username would be included EG. %username% just redeemed a promo code.',
          event_slug: 'promo-code-redemption',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 1,
          event_name: 'Contest winners',
          verbose:
            'Inform members of contest winners. Username, prize amount and contest name would be included. EG. %username% won %prize amount% in the %contest name% contest',
          event_slug: 'contest-winners',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 1,
          event_name: 'Withdrawal requests',
          verbose:
            'Inform members of all withdrawal requests that are made. Username and withdrawal amount would be included. EG. %username% - we have received your withdrawal request for %withdrawal amount%',
          event_slug: 'withdrawal-requests',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 2,
          event_name: 'Survey and Offer completions',
          verbose:
            'Credit amount, username and the survey name would be included.EG. %username% just earned %amount% with %survey supplier%',
          event_slug: 'survey-and-offer-completions',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 2,
          event_name: 'Promo code redemption',
          verbose:
            'Only username would be included EG. %username% just redeemed a promo code.',
          event_slug: 'promo-code-redemption',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 2,
          event_name: 'Contest winners',
          verbose:
            'Inform members of contest winners. Username, prize amount and contest name would be included. EG. %username% won %prize amount% in the %contest name% contest',
          event_slug: 'contest-winners',
          status: 1,
          created_at: new Date(),
          created_by: 1,
        },
        {
          company_portal_id: 2,
          event_name: 'Withdrawal requests',
          verbose:
            'Inform members of all withdrawal requests that are made. Username and withdrawal amount would be included. EG. %username% - we have received your withdrawal request for %withdrawal amount%',
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
