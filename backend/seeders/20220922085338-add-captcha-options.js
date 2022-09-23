"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add seed commands here.

    await queryInterface.bulkInsert(
      "captcha_options",
      [
        {
          id: 1,
          name: "Medium Image",
          created_by: 1,
          created_at: new Date(),
          deleted_at: null,
        },
        {
          id: 2,
          name: "Small Image",
          created_by: 1,
          created_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // Add commands to revert seed here.

    await queryInterface.bulkDelete("captcha_options", null, {});
  },
};
