'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('company_portals', 'is_google_captcha_used', {
            type: Sequelize.TINYINT,
            default: 0
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('company_portals');
    },
};
