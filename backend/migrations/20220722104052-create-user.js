'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      avatar: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_no: {
        type: Sequelize.STRING
      },
      created_by: {
        type: Sequelize.BIGINT
      },
      updated_by: {
        type: Sequelize.BIGINT
      },
      deleted_by: {
        type: Sequelize.BIGINT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.TIME
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.TIME
      },
      deleted_at: {
        type: Sequelize.TIME
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};