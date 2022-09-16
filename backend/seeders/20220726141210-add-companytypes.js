'use strict'
const company_types = [
  {
    id: 1,
    name: 'IT',
  },
  {
    id: 2,
    name: 'Others',
  },
]
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('company_types', company_types)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('company_types', null, {})
  },
}
