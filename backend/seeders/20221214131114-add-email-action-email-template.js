'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     **/
    await queryInterface.bulkInsert(
      'email_action_email_template',
      [
        { email_action_id: '1', email_template_id: '6' },
        { email_action_id: '1', email_template_id: '11' },
        { email_action_id: '2', email_template_id: '4' },
        { email_action_id: '2', email_template_id: '9' },
        { email_action_id: '3', email_template_id: '1' },
        { email_action_id: '3', email_template_id: '2' },
        { email_action_id: '8', email_template_id: '8' },
        { email_action_id: '8', email_template_id: '3' },
        { email_action_id: '9', email_template_id: '10' },
        { email_action_id: '9', email_template_id: '5' },
        { email_action_id: '10', email_template_id: '7' },
        { email_action_id: '10', email_template_id: '12' },
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
