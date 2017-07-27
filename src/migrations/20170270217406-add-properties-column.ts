'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('post', 'properties', {type: Sequelize.JSON});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeIndex('post', 'properties');
    }
};