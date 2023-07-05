'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('company_user', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      company_id: {
        allowNull: false,
        type: Sequelize.BIGINT
      },
      user_id: {
        allowNull: false,
        type: Sequelize.BIGINT
      },
      group_id: {
        allowNull: false,
        type: Sequelize.BIGINT
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('company_user');
  }
};