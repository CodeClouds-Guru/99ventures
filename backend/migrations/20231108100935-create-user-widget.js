'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_widget', {
      widget_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_widget');
  },
};
