'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('members', 'phone_no_verified_on', {
      type: 'TIMESTAMP',
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('members', 'phone_no_verified_on');
  },
};
