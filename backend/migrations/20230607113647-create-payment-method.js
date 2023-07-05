'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_methods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      comapny_portal_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
      },
      image_url: {
        type: Sequelize.STRING,
      },
      type_user_info_again: {
        type: Sequelize.TINYINT,
        comment: 'If true, force the user to type their info twice.',
      },
      payment_field_options: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Setup custom fields',
        defaultValue: 'PayPal Email',
      },
      minimum_amount: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      maximum_amount: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      fixed_amount: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      withdraw_redo_interval: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      same_account_options: {
        type: Sequelize.STRING,
      },
      past_withdrawal_options: {
        type: Sequelize.STRING,
      },
      past_withdrawal_count: {
        type: Sequelize.INTEGER,
      },
      verified_options: {
        type: Sequelize.STRING,
      },
      upgrade_options: {
        type: Sequelize.STRING,
      },
      fee_percent: {
        type: Sequelize.FLOAT,
      },
      api_username: {
        type: Sequelize.STRING,
      },
      api_password: {
        type: Sequelize.STRING,
      },
      api_signature: {
        type: Sequelize.STRING,
      },
      api_memo: {
        type: Sequelize.STRING,
      },
      payment_type: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('payment_methods');
  },
};
