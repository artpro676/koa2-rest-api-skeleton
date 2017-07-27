'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('user', 'streamerId', {type: Sequelize.INTEGER});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('user', 'streamerId');
    }
};