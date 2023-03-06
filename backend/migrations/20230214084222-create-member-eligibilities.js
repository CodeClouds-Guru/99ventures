'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('member_eligibilities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      member_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      survey_question_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      precode_id: {
        type: Sequelize.BIGINT,
      },
      text: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: 'TIMESTAMP',
      },
      updated_at: {
        type: 'TIMESTAMP',
      },
      deleted_at: {
        type: 'TIMESTAMP',
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('member_eligibilities');
  },
};
