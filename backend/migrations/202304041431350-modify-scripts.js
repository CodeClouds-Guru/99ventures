'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('scripts', 'config_json', {
            type: Sequelize.JSON
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('scripts');
    },
};
