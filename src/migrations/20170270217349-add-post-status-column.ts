'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {

        await queryInterface.addColumn('post', 'status', {type: Sequelize.STRING});
        await queryInterface.addColumn('post', 'userId', {type: Sequelize.INTEGER});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('post', 'userId');
        await queryInterface.removeColumn('post', 'status');
    }
};