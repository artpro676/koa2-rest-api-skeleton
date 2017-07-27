'use strict';

import models from '../models';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam_device', 'mobileDeviceId');
        await queryInterface.addColumn('beam_device', 'mobileDeviceUuid', {type: Sequelize.STRING});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam_device', 'mobileDeviceUuid');
        await queryInterface.addColumn('beam_device', 'mobileDeviceId', {type: Sequelize.STRING});
    }
};