"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("campaigns", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      affiliate_network: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      payout_amount: {
        type: Sequelize.FLOAT,
        allowNull:false,
      },
      trigger_postback: {
        type: Sequelize.ENUM('automatic', 'manual'),
        defaultValue:'automatic'
      },
      postback_url: {
        type: Sequelize.STRING,
      },
      track_id: {
        type: Sequelize.STRING,
      },
      condition_type: {
        type: Sequelize.ENUM('registration', 'earn_at_least', 'withdrawn_at_least', 'withdrawrn_count'),
      },
      condition_currency: {
        type: Sequelize.ENUM('cash', 'point', 'combined'),
      },
      condition_amount: {
        type: Sequelize.FLOAT,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
      },
      created_at: {
        type: "TIMESTAMP",
      },
      updated_at: {
        type: "TIMESTAMP",
      },
      deleted_at: {
        type: "TIMESTAMP",
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("campaigns");
  },
};
