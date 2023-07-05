'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'payment_methods',
      'payment_field_options'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('members', 'payment_field_options', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'PayPal Email',
      comment:
        'Setup custom fields like Paypal Email/ Paypal Username/ Paypal Phone Number',
    });
  },
};
