'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('members', 'primary_payment_method_id', {
      type: Sequelize.TINYINT,
      defaultValue: 0,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('members', 'primary_payment_method_id');
  },
};
