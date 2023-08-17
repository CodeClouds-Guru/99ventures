'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('countries', 'lucid_language_id', {
      type: Sequelize.BIGINT,
    });
    await queryInterface.addColumn('countries', 'toluna_culture_id', {
      type: Sequelize.BIGINT,
    });
    await queryInterface.addColumn('countries', 'sago_language_id', {
      type: Sequelize.BIGINT,
    });
    await queryInterface.removeColumn('countries', 'language_id');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('countries', 'lucid_language_id');
    await queryInterface.removeColumn('countries', 'toluna_culture_id');
    await queryInterface.removeColumn('countries', 'sago_language_id');
    await queryInterface.addColumn('countries', 'language_id', {
      type: Sequelize.BIGINT,
    });
  },
};
