'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('country_survey_question', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      country_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      survey_question_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
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
    await queryInterface.addIndex('country_survey_question', {
      fields: ['country_id', 'survey_question_id'],
      unique: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('country_survey_question');
  },
};
