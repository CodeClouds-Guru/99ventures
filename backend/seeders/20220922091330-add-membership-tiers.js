"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add seed commands here.

    await queryInterface.bulkInsert(
      "membership_tiers",
      [
        { id: "1", name: "1" },
        { id: "2", name: "2" },
        { id: "3", name: "3" },
        { id: "4", name: "4" },
        { id: "5", name: "5" },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // Add commands to revert seed here.

    await queryInterface.bulkDelete("membership_tiers", null, {});
  },
};
