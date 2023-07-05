'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('member_offer_wall', {
      member_id:{
        type: Sequelize.BIGINT
      },
      offer_wall_id:{
        type: Sequelize.BIGINT
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('member_offer_wall');
  }
};