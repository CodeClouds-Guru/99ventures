'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('news_reactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      news_id: {
        type: Sequelize.BIGINT,
      },
      member_id: {
        type: Sequelize.BIGINT,
      },
      reaction: {
        type: Sequelize.ENUM('0', '1'),
        defaultValue: '1',
        allowNull: false,
        comment: '0=dislike, 1=like',
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('news_reactions');
  },
};
