'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('offer_walls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_portal_id:{
        type: Sequelize.BIGINT
      },
      campaign_id:{
        type: Sequelize.BIGINT
      },
      premium_configuration: {
        type: Sequelize.ENUM('Custom', 'Premium'),
        defaultValue:'Custom'
      },
      name: {
        type: Sequelize.STRING,
      },
      sub_id_prefix: {
        type: Sequelize.STRING,
      },
      log_postback_errors: {
        type: Sequelize.TINYINT,
        defaultValue:'0'
      },
      secure_sub_ids: {
        type: Sequelize.INTEGER,
        defaultValue:'0'
      },
      status: {
        type: Sequelize.TINYINT,
        defaultValue:0
      },
      mode: {
        type: Sequelize.ENUM('Reward Tool', 'PostBack'),
        defaultValue:'Reward Tool'
      },
      allow_from_any_ip:{
        type: Sequelize.TINYINT,
        defaultValue:'0'
      },
      campaign_id_variable: {
        type: Sequelize.STRING,
      },
      campaign_name_variable: {
        type: Sequelize.STRING,
      },
      sub_id_variable: {
        type: Sequelize.STRING,
      },
      reverse_variable: {
        type: Sequelize.STRING,
      },
      reverse_value: {
        type: Sequelize.STRING,
      },
      response_ok: {
        type: Sequelize.STRING,
      },
      response_fail: {
        type: Sequelize.STRING,
      },
      currency_variable: {
        type: Sequelize.STRING,
      },
      currency_options: {
        type: Sequelize.ENUM('Cash', 'Points'),
        defaultValue:'Points'
      },
      currency_percent: {
        type: Sequelize.STRING,
      },
      currency_max: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('offer_walls');
  }
};