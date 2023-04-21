"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     **/
    await queryInterface.bulkInsert("payment_methods", [
      { id:1,name: "Paypal", slug: "paypal",status:'1' },
      { id:2,name: "Skrill", slug: "skrill",status:'1' },
      { id:3,name: "Bitcoin", slug: "bitcoin",status:'1' },
      { id:4,name: "Wise Payment", slug: "wise_payment",status:'1' },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     * */
    await queryInterface.bulkDelete("payment_methods", null, {});
  },
};
