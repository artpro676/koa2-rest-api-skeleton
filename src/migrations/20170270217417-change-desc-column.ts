'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.changeColumn('post', 'description', {type: Sequelize.TEXT});
        await queryInterface.changeColumn('user', 'deleteDescription', {type: Sequelize.TEXT});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.changeColumn('post', 'description', {type: Sequelize.STRING});
        await queryInterface.changeColumn('user', 'deleteDescription', {type: Sequelize.STRING});
    }
};