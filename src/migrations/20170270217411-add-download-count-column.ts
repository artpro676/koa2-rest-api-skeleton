'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam', 'beamedCount', {type: Sequelize.INTEGER, defaultValue: 0});
        await queryInterface.addColumn('post', 'beamedCount', {type: Sequelize.INTEGER, defaultValue: 0});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeIndex('beam', 'beamedCount');
        await queryInterface.removeIndex('post', 'beamedCount');
    }
};