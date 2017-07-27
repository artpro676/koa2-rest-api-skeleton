'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {

        await queryInterface.addColumn('user', 'enableNotification', {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        });
        await queryInterface.addColumn('user', 'emailVerified', {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        });
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('user', 'enableNotification');
        await queryInterface.removeColumn('user', 'emailVerified');
    }
};