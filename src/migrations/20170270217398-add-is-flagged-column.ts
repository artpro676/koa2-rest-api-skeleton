'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam_black_list', 'isFlagged', {type: Sequelize.BOOLEAN});
        await queryInterface.addColumn('user_black_list', 'isFlagged', {type: Sequelize.BOOLEAN});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam_black_list', 'isFlagged');
        await queryInterface.removeColumn('user_black_list', 'isFlagged');
    }
};