'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('excluded_members_payment_method', {
      payment_method_id: {
        type: Sequelize.BIGINT,
      },
      member_id: {
        type: Sequelize.BIGINT,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('excluded_members_payment_method');
  },
};
