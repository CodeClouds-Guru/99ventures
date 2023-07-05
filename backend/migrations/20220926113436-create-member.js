"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("members", {
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
      company_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      membership_tier_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "not_verified",
        comment: "member, suspended, validating, deleted, not_verified",
      },
      phone_no: {
        type: Sequelize.STRING,
      },
      country_code: {
        type: Sequelize.STRING,
      },
      dob: {
        type: Sequelize.DATE,
      },
      referer: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_active_on: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("members");
  },
};
