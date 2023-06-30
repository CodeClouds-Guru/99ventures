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
            '{"body": {"value": "<body>\n<body class=\"full-page-section\">\n{{error-message}}\n{{content}}\n</body>"}, "header": {"value": "<meta charset=\"UTF-8\">\n<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"}}',
          created_by: "1",
          created_at: new Date(),
          html: '<html><head><title>${page_title}</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="${page_descriptions ? page_descriptions : layout_descriptions}"><meta name="keywords" content="${page_keywords ? page_keywords : layout_keywords}">${page_meta_code}<!-- Additional Script Start-->${additional_header_script}${default_scripted_codes}<!-- Additional Script End --><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body class="full-page-section">{{content}}</body></html>',
        },
        {
          id: "2",
          company_portal_id: "2",
          name: "Default Layout",
          code: "default-layout",
          layout_json:
            '{"body": {"value": "<body>\n<body class=\"full-page-section\">\n{{error-message}}\n{{content}}\n</body>"}, "header": {"value": "<meta charset=\"UTF-8\">\n<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"}}',
          created_by: "1",
          created_at: new Date(),
          html: '<html><head><title>${page_title}</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="${page_descriptions ? page_descriptions : layout_descriptions}"><meta name="keywords" content="${page_keywords ? page_keywords : layout_keywords}">${page_meta_code}<!-- Additional Script Start-->${additional_header_script}${default_scripted_codes}<!-- Additional Script End --><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body class="full-page-section">{{content}}</body></html>',
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
