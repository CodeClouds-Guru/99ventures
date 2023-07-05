"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.addColumn("members", "avatar", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("members", "referral_code", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("members", "address", {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("members");
  },
};
