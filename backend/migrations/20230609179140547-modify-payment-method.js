'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('payment_methods', 'comapny_portal_id');
    await queryInterface.addColumn('payment_methods', 'company_portal_id', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
    await queryInterface.changeColumn(
      'payment_methods',
      'payment_field_options',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'PayPal Email',
        comment:
          'Setup custom fields like Paypal Email/ Paypal Username/ Paypal Phone Number',
      }
    );
    await queryInterface.changeColumn(
      'payment_methods',
      'past_withdrawal_options',
      {
        type: Sequelize.STRING,
        comment: 'At least/ At most/ Exact',
      }
    );
    await queryInterface.changeColumn('payment_methods', 'verified_options', {
      type: Sequelize.STRING,
      comment: 'Verified members/Unverified members/Both',
    });
    await queryInterface.changeColumn('payment_methods', 'payment_type', {
      type: Sequelize.STRING,
      comment: 'Auto/ Manual',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'payment_methods',
      'payment_field_options',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'PayPal Email',
        comment: 'Setup custom fields',
      }
    );
    await queryInterface.changeColumn(
      'payment_methods',
      'past_withdrawal_options',
      {
        type: Sequelize.STRING,
        comment: '',
      }
    );
    await queryInterface.changeColumn('payment_methods', 'payment_type', {
      type: Sequelize.STRING,
      comment: '',
    });
    await queryInterface.changeColumn('payment_methods', 'verified_options', {
      type: Sequelize.STRING,
      comment: '',
    });
  },
};
