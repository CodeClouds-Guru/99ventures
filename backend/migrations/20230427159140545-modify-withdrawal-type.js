'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('withdrawal_types', 'logo', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('withdrawal_types', 'min_amount', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.0,
    });
    await queryInterface.addColumn('withdrawal_types', 'max_amount', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.0,
    });
  },

  async down(queryInterface, Sequelize) {},
};
