"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("member_transactions", "batch_id", {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn("member_transactions", "payment_gateway_json", {
      type: Sequelize.JSON
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("member_transactions","batch_id");
    await queryInterface.removeColumn("member_transactions","payment_gateway_json");
  },
};
