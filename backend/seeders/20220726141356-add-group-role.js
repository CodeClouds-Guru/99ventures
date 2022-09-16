'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('group_role', [
      {
        group_id: 1,
        role_id: 1,
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('group_role', null, {})
  },
}
