'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('countries', 'language_id', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('countries', 'language_code', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('countries', 'language_name', {
      type: Sequelize.STRING,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('countries');
  },
};
