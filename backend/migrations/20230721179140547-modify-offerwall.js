'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('offer_walls', 'rating', {
      type: Sequelize.TINYINT,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('offer_walls', 'rating');
  },
};
