'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('payment_methods', 'logo', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('payment_methods', 'status', {
      type: Sequelize.ENUM('0', '1'),
      defaultValue: '1',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_methods');
  },
};
