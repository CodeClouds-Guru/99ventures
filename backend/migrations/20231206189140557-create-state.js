'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('states', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      country_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      created_at: {
        type: 'TIMESTAMP',
      },
      updated_at: {
        type: 'TIMESTAMP',
      },
      deleted_at: {
        type: 'TIMESTAMP',
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('states');
  },
};
