'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('members', 'is_shoutbox_blocked', {
            type: Sequelize.TINYINT,
            defaultValue: 0
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('members', 'is_shoutbox_blocked');
    },
};
