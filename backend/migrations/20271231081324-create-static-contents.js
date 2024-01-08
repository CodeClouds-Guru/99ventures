'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('static_contents', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            company_portal_id: { type: Sequelize.BIGINT, allowNull: false, },
            slug: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            configuration: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            created_at: {
                type: 'TIMESTAMP',
            },
            updated_at: {
                type: 'TIMESTAMP',
            },
            deleted_at: {
                type: 'TIMESTAMP',
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('static_contents');
    },
};
