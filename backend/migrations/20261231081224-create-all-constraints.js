'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.addConstraint("survey_answer_precode_survey_qualifications",{
          type: 'FOREIGN KEY',
          name: "survey_answer_precode_survey_qualifications_id_fk",
          fields: ["survey_qualification_id"],
          references: {
            table: "survey_qualifications",
            field: "id"
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
    });
    await queryInterface.addConstraint("survey_answer_precode_survey_qualifications",{
      type: 'FOREIGN KEY',
      name: "survey_answer_precode_survey_qualifications_precode_id_fk",
      fields: ["survey_answer_precode_id"],
      references: {
        table: "survey_answer_precodes",
        field: "id"
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint("survey_qualifications",{
      type: 'FOREIGN KEY',
      name: "survey_qualifications_survey_id",
      fields: ["survey_id"],
      references: {
        table: "surveys",
        field: "id"
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

  },
  async down(queryInterface, Sequelize) {
    
  },
};
