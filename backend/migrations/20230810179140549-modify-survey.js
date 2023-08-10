'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('surveys', 'country_id', {
      type: Sequelize.BIGINT,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('surveys', 'country_id');
  },
};
