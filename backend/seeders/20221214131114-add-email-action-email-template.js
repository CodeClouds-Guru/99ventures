'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     **/
    await queryInterface.bulkInsert(
      'email_action_email_template',
      [
        { email_action_id: '1', email_template_id: '18' },
        { email_action_id: '1', email_template_id: '23' },
        { email_action_id: '2', email_template_id: '16' },
        { email_action_id: '2', email_template_id: '21' },
        { email_action_id: '3', email_template_id: '1' },
        { email_action_id: '3', email_template_id: '2' },
        { email_action_id: '8', email_template_id: '14' },
        { email_action_id: '8', email_template_id: '20' },
        { email_action_id: '9', email_template_id: '17' },
        { email_action_id: '9', email_template_id: '22' },
        { email_action_id: '10', email_template_id: '19' },
        { email_action_id: '10', email_template_id: '24' },
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
    await queryInterface.bulkDelete('email_action_email_template', null, {});
  },
};
