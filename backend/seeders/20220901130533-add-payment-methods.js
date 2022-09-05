"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     **/
    await queryInterface.bulkInsert("payment_methods", [
      { name: "Paypal", slug: "paypal" },
      { name: "Skrill", slug: "skrill" },
      { name: "Bitcoin", slug: "bitcoin" },
      { name: "Wise Payment", slug: "wise_payment" },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     * */
    await queryInterface.bulkDelete("payment_methods", null, {});
  },
};
