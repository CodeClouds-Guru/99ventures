'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     */
    await queryInterface.bulkInsert(
      'withdrawal_types',
      [
        {
          name: 'Paypal',
          slug: 'paypal',
          payment_method_id: 1,
        },
        {
          name: 'Instant Paypal',
          slug: 'instant_paypal',
          payment_method_id: 1,
        },
        {
          name: 'Skrill',
          slug: 'skrill',
          payment_method_id: 2,
        },
        {
          name: 'Gift Card Pass',
          slug: 'gift_card_pass',
          payment_method_id: 3,
        },
        {
          name: 'Venmo',
          slug: 'venmo',
          payment_method_id: 3,
        },
        {
          name: 'E-gift Cards',
          slug: 'e_gift_cards',
          payment_method_id: 3,
        },
        {
          name: 'E-gift Cards',
          slug: 'e_gift_cards',
          payment_method_id: 3,
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
    await queryInterface.bulkDelete('withdrawal_types', null, {});
  },
};
