'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('surveys', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      survey_provider_id: {
        type: Sequelize.BIGINT
      },
      ioi: {
        type: Sequelize.FLOAT
      },
      payout: {
        type: Sequelize.FLOAT
      },
      convertion_rate: {
        type: Sequelize.FLOAT
      },
      score: {
        type: Sequelize.FLOAT
      },
      statistic_rating_count: {
        type: Sequelize.FLOAT
      },
      statistic_rating_avg: {
        type: Sequelize.FLOAT
      },
      type: {
        type: Sequelize.STRING
      },
      payout_publisher_usd: {
        type: Sequelize.FLOAT
      },
      href: {
        type: Sequelize.STRING
      },
      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('surveys');
  }
};