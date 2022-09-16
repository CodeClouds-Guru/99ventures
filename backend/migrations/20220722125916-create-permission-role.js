'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permission_role', {
      permission_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      role_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('permission_role');
  }
};