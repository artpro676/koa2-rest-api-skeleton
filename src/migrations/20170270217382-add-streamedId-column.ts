'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam_device', 'streamedId', {type: Sequelize.INTEGER});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam_device', 'streamedId');
    }
};