'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('company_portals', [
      {
        domain: 'testdomain.com',
        name: 'Test Site',
        status: 1,
        created_by: 1,
        company_id: 1,
        created_at: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('company_portals', null, {})
  },
}
