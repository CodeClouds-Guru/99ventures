'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('members', 'city', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.removeColumn('members', 'address_3');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('members');
  },
};
