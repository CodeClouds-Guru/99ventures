"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add seed commands here.

    await queryInterface.bulkInsert(
      "site_layouts",
      [
        {
          id: 1,
          html: "{% Header %} {% Body %} {% Footer %}",
          name: "Default",
          created_by: 1,
          created_at: new Date(),
        },
        {
          id: 2,
          html: "{% Body %}",
          name: "Full Page",
          created_by: 1,
          created_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    //  Add commands to revert seed here.

    await queryInterface.bulkDelete("site_layouts", null, {});
  },
};
