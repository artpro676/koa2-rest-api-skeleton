'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('user', 'streamUpdatedAt', {type: Sequelize.DATE});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('user', 'streamUpdatedAt');
    }
};