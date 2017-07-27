'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('token', 'userAuthId', {type: Sequelize.INTEGER});
        await queryInterface.removeColumn('user_auth', 'token');
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('token', 'userAuthId');
        await queryInterface.addColumn('user_auth', 'token', {type: Sequelize.STRING});
    }
};