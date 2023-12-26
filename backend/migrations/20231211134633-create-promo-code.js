'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('promo_codes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      max_uses: {
        type: Sequelize.TINYINT,
        allowNull: false,
      },
      cash: {
        type: Sequelize.FLOAT,
      },
      point: {
        type: Sequelize.TINYINT,
      },
      used: {
        type: Sequelize.TINYINT,
      },
      note: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: 'TIMESTAMP',
        allowNull: false,
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
      status: {
        type: Sequelize.ENUM('active', 'expired'),
        defaultValue: 'active',
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('promo_codes');
  },
};
