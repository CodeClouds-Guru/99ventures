'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('company_portals', [
      {
        id: 1,
        domain: 'moresurveys.com',
        name: 'Test Site',
        status: 1,
        created_by: 1,
        company_id: 1,
        created_at: new Date(),
      },
      {
        id: 2,
        company_id: 2,
        domain: '99ventures.com',
        name: '99 Ventures',
        status: 1,
        created_by: 1,
        created_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('company_portals', null, {});
  },
};
