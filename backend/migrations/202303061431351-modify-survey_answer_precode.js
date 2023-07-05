'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('survey_answer_precodes', 'schlesigner_precode');
        await queryInterface.removeColumn('survey_answer_precodes', 'dynata_precode');
        await queryInterface.renameColumn('survey_answer_precodes', 'lucid_precode', 'precode');
        await queryInterface.removeColumn('survey_answer_precodes', 'purespectrum_precode');
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('survey_answer_precodes');
    },
};
