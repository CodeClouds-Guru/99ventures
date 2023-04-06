'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('scripts', 'type', {
            type: Sequelize.STRING,
            defaultValue: 'custom',
            comment: "custom, predefined"
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('scripts');
    },
};
