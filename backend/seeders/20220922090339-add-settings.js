'use strict';

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
      images: ['image/jpeg', 'image/png'],
      documents: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/pdf',
      ],
      videos: [],
      audio: [],
    };
    await queryInterface.bulkInsert(
      'settings',
      [
        {
          company_portal_id: 1,
          settings_key: 'file_manager_configuration',
          settings_value: JSON.stringify(fileManagerConfigObj),
          created_by: 1,
          created_at: new Date(),
        },
        {
          company_portal_id: 1,
          settings_key: 'max_file_size',
          settings_value: 2,
          created_by: 1,
          created_at: new Date(),
        },
        {
          company_portal_id: 1,
          settings_key: 'max_no_of_uploads',
          settings_value: 5,
          created_by: 1,
          created_at: new Date(),
        },
        {
          company_portal_id: 1,
          settings_key: 'referral_status',
          settings_value: 1,
          created_by: 1,
          created_at: new Date(),
        },
        {
          company_portal_id: 1,
          settings_key: 'referral_percentage',
          settings_value: 10,
          created_by: 1,
          created_at: new Date(),
        },
        {
          company_portal_id: 1,
          settings_key: 'registration_bonus',
          settings_value: 0.27,
          created_by: 1,
          created_at: new Date(),
        },
        {
          company_portal_id: 1,
          settings_key: 'complete_profile_bonus',
          settings_value: 0.25,
          created_by: 1,
          created_at: new Date(),
        },
        {
          company_portal_id: 2,
          settings_key: 'file_manager_configuration',
          settings_value: JSON.stringify(fileManagerConfigObj),
          created_by: 1,
          created_at: new Date(),
        },
        {
          company_portal_id: 2,
          settings_key: 'max_file_size',
          settings_value: 2,
          created_by: 1,
          created_at: new Date(),
        },
        {
          company_portal_id: 2,
          settings_key: 'max_no_of_uploads',
          settings_value: 5,
          created_by: 1,
          created_at: new Date(),
        },
        {
          company_portal_id: 2,
          settings_key: 'referral_status',
          settings_value: 1,
          created_by: 1,
          created_at: new Date(),
        },
        {
          company_portal_id: 2,
          settings_key: 'referral_percentage',
          settings_value: 10,
          created_by: 1,
          created_at: new Date(),
        },
        {
          company_portal_id: 2,
          settings_key: 'registration_bonus',
          settings_value: 0.27,
          created_by: 1,
          created_at: new Date(),
        },
        {
          company_portal_id: 2,
          settings_key: 'complete_profile_bonus',
          settings_value: 0.25,
          created_by: 1,
          created_at: new Date(),
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    //  Add commands to revert seed here.

    await queryInterface.bulkDelete('settings', null, {});
  },
};
