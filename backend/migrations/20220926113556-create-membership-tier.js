'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('membership_tiers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('membership_tiers');
  }
};