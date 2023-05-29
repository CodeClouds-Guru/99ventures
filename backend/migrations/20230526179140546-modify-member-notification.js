'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('member_notifications', 'is_read', {
      type: Sequelize.TINYINT,
      comment: '0=read, 1=unread',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('member_notifications', 'is_read', {
      type: Sequelize.TINYINT,
      comment: '0=read, 1=unread',
    });
  },
};
