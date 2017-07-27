'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {

        await queryInterface.addColumn('beam_device', 'downloadedBeams', {
            type: Sequelize.INTEGER
        });
        await queryInterface.addColumn('beam_device', 'lastPairedAt', {
            type: Sequelize.DATE
        });
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam_device', 'downloadedBeams');
        await queryInterface.removeColumn('beam_device', 'lastPairedAt');
    }
};