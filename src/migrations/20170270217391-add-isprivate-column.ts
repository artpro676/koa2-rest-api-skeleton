'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('user', 'isPrivate', {type: Sequelize.BOOLEAN});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('user', 'isPrivate');
    }
};