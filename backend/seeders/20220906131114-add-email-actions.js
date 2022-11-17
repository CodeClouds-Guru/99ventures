"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     **/
    await queryInterface.bulkInsert(
      "email_actions",
      [
        {
          action: "Invitation",
        },
        {
          action: "Welcome",
        },
        {
          action: "Forgot Password",
        },
        {
          action: "Account Deactivated",
        },
        {
          action: "Withdraw Request",
        },
        {
          action: "Payment Confirmation",
        },
        {
          action: "Contact Us",
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
