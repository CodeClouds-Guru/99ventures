'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'member_eligibilities',
      'open_ended_value',
      {
        type: Sequelize.STRING,
      }
    );
    await queryInterface.renameColumn('member_eligibilities', 'precode_id', 'survey_answer_precode_id');
    
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'member_eligibilities',
      'open_ended_value'
    );
    await queryInterface.renameColumn('member_eligibilities', 'survey_answer_precode_id','precode_id');
    
  },
};
