"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add seed commands here.

    Example: await queryInterface.bulkInsert(
      "pages",
      [
        {
          id: 1,
          company_portal_id: 2,
          html: "<h1>Home</h1>",
          status: "draft",
          parmalink: "/",
          is_homepage: 1,
          slug: "/",
          name: "Home Page",
          created_by: 1,
          created_at: new Date(),
        },
        {
          id: 2,
          company_portal_id: 2,
          html: "<h1>About Us</h1>",
          status: "draft",
          parmalink: "/",
          is_homepage: 1,
          slug: "/",
          name: "About Us",
          created_by: 1,
          created_at: new Date(),
        },
        {
          id: 3,
          company_portal_id: 1,
          html: "<h1>Test</h1>",
          status: "draft",
          parmalink: "/",
          is_homepage: 1,
          slug: "/",
          name: "Test Page",
          created_by: 1,
          created_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // Add commands to revert seed here.

    await queryInterface.bulkDelete("pages", null, {});
  },
};
