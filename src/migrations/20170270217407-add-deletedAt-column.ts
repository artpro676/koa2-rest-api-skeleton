'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('user', 'deletedAt', {type: Sequelize.DATE});
        await queryInterface.addColumn('content_key', 'deletedAt', {type: Sequelize.DATE});
        // await queryInterface.addColumn('follow', 'deletedAt', {type: Sequelize.DATE});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeIndex('user', 'deletedAt');
        await queryInterface.removeIndex('content_key', 'deletedAt');
        // await queryInterface.removeIndex('follow', 'deletedAt');
    }
};