'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('company_user', [
      {
        group_id: 1,
        company_id: 1,
        user_id: 1,
      },
      {
        group_id: 1,
        company_id: 1,
        user_id: 2,
      },
      {
        group_id: 1,
        company_id: 1,
        user_id: 3,
      },
      {
        group_id: 1,
        company_id: 1,
        user_id: 4,
      },
      {
        group_id: 1,
        company_id: 1,
        user_id: 5,
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('company_user', null, {})
  },
}
