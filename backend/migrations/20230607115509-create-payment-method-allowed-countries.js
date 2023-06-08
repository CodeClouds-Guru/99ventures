'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('allowed_country_payment_method', {
      payment_method_id: {
        type: Sequelize.BIGINT,
      },
      country_id: {
        type: Sequelize.BIGINT,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('allowed_country_payment_method');
  },
};
