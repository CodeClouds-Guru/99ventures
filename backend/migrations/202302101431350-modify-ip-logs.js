'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('ip_logs', 'fraud_score', {
            type: Sequelize.INTEGER,
        });
        await queryInterface.addColumn('ip_logs', 'proxy', {
            type: Sequelize.TINYINT,
        });
        await queryInterface.addColumn('ip_logs', 'vpn', {
            type: Sequelize.TINYINT,
        });
        await queryInterface.addColumn('ip_logs', 'tor', {
            type: Sequelize.TINYINT,
        });
        await queryInterface.addColumn('ip_logs', 'bot_status', {
            type: Sequelize.TINYINT,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ip_logs');
    },
};
