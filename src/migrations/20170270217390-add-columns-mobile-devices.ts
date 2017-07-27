'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam_device', 'firmwareRevision', {type: Sequelize.STRING});
        await queryInterface.addColumn('beam_device', 'hardwareRevision', {type: Sequelize.STRING});
        await queryInterface.addColumn('beam_device', 'serialNumber', {type: Sequelize.STRING});
        await queryInterface.addColumn('beam_device', 'manufacturerName', {type: Sequelize.STRING});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam_device', 'firmwareRevision');
        await queryInterface.removeColumn('beam_device', 'hardwareRevision');
        await queryInterface.removeColumn('beam_device', 'serialNumber');
        await queryInterface.removeColumn('beam_device', 'manufacturerName');

    }
};