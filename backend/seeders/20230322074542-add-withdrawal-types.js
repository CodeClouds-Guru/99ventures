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
        },
        {
          name: 'Skrill',
          slug: 'skrill',
        },
        {
          name: 'Gift Card Pass',
          slug: 'gift_card_pass',
        },
        {
          name: 'Venmo',
          slug: 'venmo',
        },
        {
          name: 'E-gift Cards',
          slug: 'e_gift_cards',
        },
        {
          name: 'E-gift Cards',
          slug: 'e_gift_cards',
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
