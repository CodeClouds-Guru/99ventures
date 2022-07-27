'use strict';
const roles = [
  {
    name: "Admin",
    slug: "admin",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date()
  },
  {
    name: "Owner",
    slug: "owner",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date()
  },
];
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
     await queryInterface.bulkInsert("roles", users);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete("roles", null, {});
  }
};
