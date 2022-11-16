'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('company_portal_survey_providers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      survey_provider_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      company_portal_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      endpoint: {
        type: Sequelize.STRING
      },
      api_key: {
        type: Sequelize.STRING
      },
      api_secret: {
        type: Sequelize.STRING
      },
      survey_portal_url: {
        type: Sequelize.STRING
      },
      postback_url: {
        type: Sequelize.STRING
      },
      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('company_portal_survey_providers');
  }
};