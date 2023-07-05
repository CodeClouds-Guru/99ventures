'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('company_portals', {
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
      site_layout_id : {
        type: Sequelize.BIGINT
      },
      domain: {
        type: Sequelize.STRING
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      downtime_message: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.TINYINT,
        defaultValue:1,
        comment: "0=Inactive, 1=Active, 2=Shutdown"
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
    await queryInterface.dropTable('company_portals');
  }
};