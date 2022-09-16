'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_role', {
      group_id: {
        allowNull: false,
        type: Sequelize.BIGINT
      },
      role_id: {
        allowNull: false,
        type: Sequelize.BIGINT
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_role');
  }
};