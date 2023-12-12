'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('survey_attempts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      survey_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      member_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      survey_provider_id: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex('survey_attempts', {
      fields: ['survey_number', 'member_id', 'survey_provider_id'],
      unique: true,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      'survey_attempts',
      'survey_number_member_id_survey_provider_id'
    );
    await queryInterface.dropTable('survey_attempts');
  },
};
