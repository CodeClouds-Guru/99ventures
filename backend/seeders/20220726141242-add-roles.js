'use strict'
const roles = [
  {
    id: 1,
    name: 'super-admin',
    slug: 'Super Admin',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    id: 2,
    name: 'admin',
    slug: 'Admin',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    id: 3,
    name: 'member',
    slug: 'Member',
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
]
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert('roles', roles)
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('roles', null, {})
  },
}
