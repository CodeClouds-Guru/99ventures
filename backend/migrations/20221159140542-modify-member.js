"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("members", "country_code", {
      type: Sequelize.INTEGER,
      comment: 'It will store country id instead of code',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("members");
  },
};
