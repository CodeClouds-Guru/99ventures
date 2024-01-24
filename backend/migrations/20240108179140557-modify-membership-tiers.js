'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('membership_tiers', 'logo', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('membership_tiers', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'archived'),
      allowNull: false,
      defaultValue: 'active',
    });
    await queryInterface.addColumn('membership_tiers', 'reward_point', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn('membership_tiers', 'reward_cash', {
      type: Sequelize.FLOAT,
      defaultValue: 0,
    });
    await queryInterface.addColumn('membership_tiers', 'created_at', {
      type: 'TIMESTAMP',
    });
    await queryInterface.addColumn('membership_tiers', 'updated_at', {
      type: 'TIMESTAMP',
    });
    await queryInterface.addColumn('membership_tiers', 'deleted_at', {
      type: 'TIMESTAMP',
    });
    await queryInterface.addColumn('membership_tiers', 'created_by', {
      type: Sequelize.TINYINT,
      allowNull: true,
    });
    await queryInterface.addColumn('membership_tiers', 'updated_by', {
      type: Sequelize.TINYINT,
      allowNull: true,
    });
    await queryInterface.addColumn('membership_tiers', 'deleted_by', {
      type: Sequelize.TINYINT,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('membership_tiers', 'logo');
  },
};
