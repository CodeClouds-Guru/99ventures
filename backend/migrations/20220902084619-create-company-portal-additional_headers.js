"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("company_portal_additional_headers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      company_portal_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      tag_content: {
        type: Sequelize.TEXT,
      },

      created_by: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      updated_by: {
        type: Sequelize.BIGINT,
      },
      deleted_by: {
        type: Sequelize.BIGINT,
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
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("company_portal_additional_headers");
  },
};
