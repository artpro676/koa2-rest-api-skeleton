'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('follow', 'isPermanent', {type: Sequelize.BOOLEAN, defaultValue: false});
        await queryInterface.addColumn('user', 'isPermanentFollowing', {type: Sequelize.BOOLEAN, defaultValue: false});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeIndex('follow', 'isPermanent');
        await queryInterface.removeIndex('user', 'isPermanentFollowing');
    }
};