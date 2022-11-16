"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add seed commands here.
    // var fileManagerConfigObj = {
    //   images: ["jpeg", "jpg", "png", "gif"],
    //   files: ["css", "js", "html"],
    //   documents: ["xlsx", "pdf", "xlx", "docx", "doc", "odt"],
    //   audio: ["mp3"],
    // };
    let fileManagerConfigObj = {
      images: ["image/jpeg", "image/png"],
      documents: [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/pdf",
      ],
      videos: [],
      audio: [],
    };
    await queryInterface.bulkInsert(
      "settings",
      [
        {
          id: 1,
          company_portal_id: 1,
          settings_key: "file_manager_configuration",
          settings_value: JSON.stringify(fileManagerConfigObj),
          created_by: 1,
          created_at: new Date(),
        },
        {
          id: 2,
          company_portal_id: 1,
          settings_key: "max_file_size",
          settings_value: 2,
          created_by: 1,
          created_at: new Date(),
        },
        {
          id: 3,
          company_portal_id: 1,
          settings_key: "max_no_of_uploads",
          settings_value: 5,
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
