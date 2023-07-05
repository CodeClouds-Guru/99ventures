'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add seed commands here.

    await queryInterface.bulkInsert(
      'membership_tiers',
      [
        { id: '1', name: 'Bronze' },
        { id: '2', name: 'Silver' },
        { id: '3', name: 'Gold' },
        { id: '4', name: 'Platinum' },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // Add commands to revert seed here.

    await queryInterface.bulkDelete('membership_tiers', null, {});
  },
};
