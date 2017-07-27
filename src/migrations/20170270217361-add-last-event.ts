'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('user', 'lastEventId', {type: Sequelize.INTEGER});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('user', 'lastEventId');
    }
};