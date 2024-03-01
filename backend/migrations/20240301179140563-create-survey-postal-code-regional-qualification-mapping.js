'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'survey_postal_code_regional_qualification_mapping',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        country_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        standard_county_gb: {
          type: Sequelize.STRING,
        },
        postal_code: {
          type: Sequelize.STRING,
        },
        region: {
          type: Sequelize.STRING,
        },
        state: {
          type: Sequelize.STRING,
        },
        division: {
          type: Sequelize.STRING,
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
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(
      'survey_postal_code_regional_qualification_mapping'
    );
  },
};
