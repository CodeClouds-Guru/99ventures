'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('shoutbox_configurations', 'verbose', {
            type: Sequelize.TEXT,
        });
        await queryInterface.addColumn('shoutbox_configurations', 'event_slug', {
            type: Sequelize.STRING,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('shoutbox_configurations');
    },
};
