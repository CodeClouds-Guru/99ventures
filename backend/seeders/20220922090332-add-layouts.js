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
            '{"body": {"value": [{"code": "{{content}}", "name": "Content"}]}, "header": {"value": ""}}',
          created_by: "1",
          created_at: "2022-11-14 07:43:47",
          html: '<html>\n            <head>\n                <title>{{ page_title}}</title>\n                <meta name="viewport" content="width=device-width, initial-scale=1.0">\n                \n            </head>\n            <body>{{content}}</body>\n        </html>',
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
