'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('surveys', 'status', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('surveys', 'original_json', {
      type: Sequelize.JSON,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('surveys');
  },
};
