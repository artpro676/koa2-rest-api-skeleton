'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam_device', 'beamId', {type: Sequelize.ARRAY(Sequelize.INTEGER)});
        await queryInterface.removeColumn('beam_device', 'downloadedBeams');
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam_device', 'downloadedBeams', {type: Sequelize.INTEGER});
        await queryInterface.removeColumn('beam_device', 'beamId');
    }
};