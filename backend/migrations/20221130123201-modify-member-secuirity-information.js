'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("member_security_informations", "latitude", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("member_security_informations", "longitude", {
      type: Sequelize.STRING,
    });
    await queryInterface.renameTable("member_security_informations", "ip_logs");
  },
  
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ip_logs');
  }
};