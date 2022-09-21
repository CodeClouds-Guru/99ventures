'use strict'
const companies = [
  {
    id: 1,
    name: 'CodeClouds',
    company_type_id: 1,
    slug: 'CC',
    status: 1,
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    created_at: new Date(),
  },
  {
    id: 2,
    name: '99 Ventures',
    company_type_id: 1,
    slug: '99_ventures',
    status: 1,
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
    await queryInterface.bulkInsert('companies', companies)
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('companies', null, {})
  },
}
