'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint(
      'survey_answer_precode_survey_qualifications',
      {
        type: 'FOREIGN KEY',
        name: 'survey_answer_precode_survey_qualifications_id_fk',
        fields: ['survey_qualification_id'],
        references: {
          table: 'survey_qualifications',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }
    );
    await queryInterface.addConstraint(
      'survey_answer_precode_survey_qualifications',
      {
        type: 'FOREIGN KEY',
        name: 'survey_answer_precode_survey_qualifications_precode_id_fk',
        fields: ['survey_answer_precode_id'],
        references: {
          table: 'survey_answer_precodes',
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }
    );
    await queryInterface.addConstraint('survey_qualifications', {
      type: 'FOREIGN KEY',
      name: 'survey_qualifications_survey_id',
      fields: ['survey_id'],
      references: {
        table: 'surveys',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    //iplogs - member
    await queryInterface.addConstraint('ip_logs', {
      type: 'FOREIGN KEY',
      name: 'ip_logs_FK',
      fields: ['member_id'],
      references: {
        table: 'members',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    //member_payment_informations - member
    await queryInterface.addConstraint('member_payment_informations', {
      type: 'FOREIGN KEY',
      name: 'member_payment_informations_FK',
      fields: ['member_id'],
      references: {
        table: 'members',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    //member_transactions - member
    await queryInterface.addConstraint('member_transactions', {
      type: 'FOREIGN KEY',
      name: 'member_transactions_FK',
      fields: ['member_id'],
      references: {
        table: 'members',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    //email_alert_member - member
    await queryInterface.addConstraint('email_alert_member', {
      type: 'FOREIGN KEY',
      name: 'email_alert_member_FK',
      fields: ['member_id'],
      references: {
        table: 'members',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    //withdrawal_requests - member
    await queryInterface.addConstraint('withdrawal_requests', {
      type: 'FOREIGN KEY',
      name: 'withdrawal_requests_FK',
      fields: ['member_id'],
      references: {
        table: 'members',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
  async down(queryInterface, Sequelize) {},
};
