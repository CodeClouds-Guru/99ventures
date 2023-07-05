"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("member_transactions", "type", {
      type: Sequelize.ENUM('credited', 'withdraw','admin_adjustment'),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("member_transactions");
  },
};
