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
          id: 1,
          name: 'Paypal',
          slug: 'paypal',
          payment_method_id: 1,
          min_amount: 1,
          max_amount: null,
        },
        {
          id: 2,
          name: 'Instant Paypal',
          slug: 'instant_paypal',
          payment_method_id: 1,
          min_amount: 1,
          max_amount: 50,
        },
        {
          id: 3,
          name: 'Skrill',
          slug: 'skrill',
          payment_method_id: 2,
          min_amount: 5,
          max_amount: null,
        },
        {
          id: 4,
          name: 'Gift Card Pass',
          slug: 'gift_card_pass',
          payment_method_id: 3,
          min_amount: null,
          max_amount: null,
        },
        {
          id: 5,
          name: 'Venmo',
          slug: 'venmo',
          payment_method_id: 3,
          min_amount: 20,
          max_amount: null,
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
