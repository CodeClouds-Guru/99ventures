'use strict';
const roles = [
  {
    name: "User Create",
    slug: "user-create",
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date()
  },
  {
    name: "User List",
    slug: "user-list",
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
     await queryInterface.bulkInsert("permissions", users);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete("permissions", null, {});
  }
};
