'use strict'
const { Module, Action } = require('../models')
const { cartesian } = require('../helpers/global')
module.exports = {
  async up(queryInterface, Sequelize) {
    const modules = await Module.findAll()
    const actions = await Action.findAll()
    const types = ['all', 'group', 'owner']
    let permissions = cartesian(
      types,
      modules.map((item) => item.name),
      actions.map((item) => item.name)
    )
    permissions = permissions.map((item) => {
      return {
        name: item.join('-'),
        slug: item.join(' '),
        created_by: 1,
        created_at: new Date(),
      }
    })
    await queryInterface.bulkInsert('permissions', permissions)
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('permissions', null, {})
  },
}
