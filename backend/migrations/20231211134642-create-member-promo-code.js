'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('member_promo_codes', {
      member_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      promo_code_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('member_promo_codes');
  },
};
