"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("members", "address_1", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("members", "address_2", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("members", "address_3", {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
  
    await queryInterface.dropTable("members");
  },
};
