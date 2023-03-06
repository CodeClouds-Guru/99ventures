'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('survey_answer_precodes', 'schlesigner_precode', {
            type: Sequelize.STRING,
        });
        await queryInterface.addColumn('survey_answer_precodes', 'dynata_precode', {
            type: Sequelize.STRING,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('survey_answer_precodes');
    },
};
