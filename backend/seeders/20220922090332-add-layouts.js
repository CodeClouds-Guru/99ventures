"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add seed commands here.

    await queryInterface.bulkInsert(
      "layouts",
      [
        {
          id: "1",
          company_portal_id: "1",
          name: "Default Layout",
          code: "default-layout",
          layout_json:
            '{"body": {"value": "<body>{{content}}</body>"},"header": {"value": ""}}',
          created_by: "1",
          created_at: new Date(),
          html: '<html><head><title>${page_title}</title><meta name="description" content="${page_descriptions ? page_descriptions : layout_descriptions}"><meta name="keywords" content="${page_keywords ? page_keywords : layout_keywords}">${page_meta_code}<meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>{{content}}</body></html>',
        },
        {
          id: "2",
          company_portal_id: "2",
          name: "Default Layout",
          code: "default-layout",
          layout_json:
            '{"body": {"value": "<body>{{content}}</body>"},"header": {"value": ""}}',
          created_by: "1",
          created_at: new Date(),
          html: '<html><head><title>${page_title}</title><meta name="description" content="${page_descriptions ? page_descriptions : layout_descriptions}"><meta name="keywords" content="${page_keywords ? page_keywords : layout_keywords}">${page_meta_code}<meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>{{content}}</body></html>',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    //  Add commands to revert seed here.

    await queryInterface.bulkDelete("layouts", null, {});
  },
};
