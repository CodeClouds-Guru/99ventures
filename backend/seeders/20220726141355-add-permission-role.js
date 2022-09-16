'use strict'
const { Permission } = require('../models')
module.exports = {
  async up(queryInterface, Sequelize) {
    let permissions = await Permission.findAll({
      where: {},
      attributes: ['id'],
    })
    permissions = permissions.map((item) => {
      return { permission_id: item.id, role_id: 1 }
    })
    await queryInterface.bulkInsert('permission_role', permissions)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permission_role', null, {})
  },
}
