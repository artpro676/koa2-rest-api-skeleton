'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('post', 'pushedToDevice', {type: Sequelize.BOOLEAN, defaultValue: false});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('post', 'pushedToDevice');
    }
};