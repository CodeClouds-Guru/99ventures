'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('members', 'id', {
      type: Sequelize.BIGINT,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('members', 'id', {
      type: Sequelize.INTEGER,
    });
  },
};
