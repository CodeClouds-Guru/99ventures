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
          id: "1",
          action: "Invitation",
        },
        {
          id: "2",
          action: "Welcome",
        },
        {
          id: "3",
          action: "Forgot Password",
        },
        {
          id: "4",
          action: "Account Deactivated",
        },
        {
          id: "5",
          action: "Withdraw Request",
        },
        {
          id: "6",
          action: "Payment Confirmation",
        },
        {
          id: "7",
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
