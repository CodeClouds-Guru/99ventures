'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('withdrawal_requests', 'program_id', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('withdrawal_requests', 'sks', {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {},
};
