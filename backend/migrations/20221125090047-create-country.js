'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('countries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      iso: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      nicename: {
        type: Sequelize.STRING
      },
      iso3: {
        type: Sequelize.STRING
      },
      numcode: {
        type: Sequelize.INTEGER
      },
      phonecode: {
        type: Sequelize.INTEGER
      },
      created_at: {
        type: "TIMESTAMP",
      },
      updated_at: {
        type: "TIMESTAMP",
      },
      deleted_at: {
        type: "TIMESTAMP",
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('countries');
  }
};