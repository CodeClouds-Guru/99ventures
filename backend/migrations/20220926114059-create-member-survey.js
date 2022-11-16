"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("member_surveys", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      survey_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      member_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("member_surveys");
  },
};
