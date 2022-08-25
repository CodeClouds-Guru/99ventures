"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pages", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      company_portal_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      html: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      parmalink: {
        type: Sequelize.STRING,
      },
      is_homepage: {
        type: Sequelize.TINYINT,
        allowNull: false,
        default: 0,
      },
      slug: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      part_url: {
        type: Sequelize.STRING,
      },
      created_by: {
        type: Sequelize.BIGINT,
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
    await queryInterface.dropTable("pages");
  },
};
