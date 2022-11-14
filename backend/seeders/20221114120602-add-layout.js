'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   let layout_json = {
          header: {value: ''},
          body: {
            value: [{
              name: 'Content',
              code: '{{content}}'
            }]
          }
        }
     await queryInterface.bulkInsert(
      "layouts",
      [
        {
          id: 1,
          html: "<html><head><title>{{ page_title}}</title><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"></head><body>{{content}}</body></html>",
          name: "Default Layout",
          code:"default-layout",
          company_portal_id:1,
          layout_json:JSON.stringify(layout_json),
          created_by: 1,
          created_at: new Date(),
        },
        {
          id: 2,
          html: "<html><head><title>{{ page_title}}</title><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"></head><body>{{content}}</body></html>",
          name: "Default Layout",
          code:"default-layout1",
          company_portal_id:2,
          layout_json:JSON.stringify(layout_json),
          created_by: 1,
          created_at: new Date(),
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
