'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('promo_codes', 'company_portal_id', {
      type: Sequelize.TINYINT,
      allowNull: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('payment_methods', 'company_portal_id');
  },
};
