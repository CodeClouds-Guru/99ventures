'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('promo_codes', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('promo_codes', 'description', {
      type: Sequelize.TEXT,
    });
    await queryInterface.removeColumn('promo_codes', 'slug');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('promo_codes', 'name');
    await queryInterface.removeColumn('promo_codes', 'description');
  },
};
