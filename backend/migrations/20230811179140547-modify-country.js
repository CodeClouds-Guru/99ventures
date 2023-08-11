'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('countries', 'lucid_language_code', {
      type: Sequelize.BIGINT,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('countries', 'lucid_language_code');
  },
};
