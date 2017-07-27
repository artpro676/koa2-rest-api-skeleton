'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam_device', 'name', {type: Sequelize.STRING});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam_device', 'name');
    }
};