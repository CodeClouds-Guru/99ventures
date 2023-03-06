"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("company_portal_surveys", {
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
      survey_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("company_portal_surveys");
  },
};
