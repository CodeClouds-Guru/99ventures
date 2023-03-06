'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('google_captcha_configurations', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            company_portal_id: {
                type: Sequelize.BIGINT
            },
            site_key: {
                type: Sequelize.STRING
            },
            site_token: {
                type: Sequelize.STRING
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('google_captcha_configurations');
    }
};