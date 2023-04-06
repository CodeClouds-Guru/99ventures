"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("survey_postbacks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      survey_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("survey_postbacks");
  },
};
