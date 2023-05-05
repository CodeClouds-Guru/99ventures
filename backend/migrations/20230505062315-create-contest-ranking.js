'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contest_rankings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      contest_leaderboard_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      member_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      rank: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      earning: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      credited_on: {
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contest_rankings');
  },
};
