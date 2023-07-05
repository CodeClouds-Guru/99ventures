"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.changeColumn("survey_questions", "question_text", {
      type: Sequelize.TEXT
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("survey_questions");
  },
};
