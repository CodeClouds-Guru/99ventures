'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     **/
    await queryInterface.bulkInsert(
      'survey_providers',
      [
        {
          name: 'Lucid',
          logo: null,
          status: 1,
          created_by: 1,
          created_at: new Date(),
        },
        {
          name: 'Cint',
          logo: null,
          status: 1,
          created_by: 1,
          created_at: new Date(),
        },
        {
          name: 'Purespectrum',
          logo: null,
          status: 1,
          created_by: 1,
          created_at: new Date(),
        },
        {
          name: 'Schlesinger',
          logo: null,
          status: 1,
          created_by: 1,
          created_at: new Date(),
        },
        {
          name: 'Dynata',
          logo: null,
          status: 1,
          created_by: 1,
          created_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('survey_providers', null, {});
  },
};
