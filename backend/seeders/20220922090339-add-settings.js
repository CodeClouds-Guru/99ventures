"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add seed commands here.
    var obj = {
      images: ["jpeg", "jpg", "png", "gif"],
      files: ["css", "js", "html"],
      documents: ["xlsx", "pdf", "xlx", "docx", "doc", "odt"],
    };
    await queryInterface.bulkInsert(
      "settings",
      [
        {
          id: 1,
          company_portal_id: 1,
          settings_key: "file_config",
          settings_value: JSON.stringify(obj),
          created_by: 1,
          created_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    //  Add commands to revert seed here.

    await queryInterface.bulkDelete("settings", null, {});
  },
};
