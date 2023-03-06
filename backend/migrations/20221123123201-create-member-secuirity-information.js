'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('member_security_informations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      member_id: {
        type: Sequelize.BIGINT
      },
      geo_location: {
        type: Sequelize.STRING
      },
      ip: {
        type: Sequelize.STRING
      },
      isp: {
        type: Sequelize.STRING
      },
      browser: {
        type: Sequelize.STRING
      },
      browser_language: {
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
        type: "TIMESTAMP",
        allowNull: false,
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
    await queryInterface.dropTable('member_security_informations');
  }
};