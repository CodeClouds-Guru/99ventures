'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // await queryInterface.addColumn('scripts', 'module', {
        //     type: Sequelize.STRING,
        // });
    },
    async down(queryInterface, Sequelize) {
        // await queryInterface.dropTable('scripts');
    },
};
