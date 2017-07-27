'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam', 'trendingWeight', {type: Sequelize.INTEGER, defaultValue: 0});
        await queryInterface.addColumn('beam', 'selectedWeight', {type: Sequelize.INTEGER, defaultValue: 0});
        await queryInterface.addColumn('beam', 'hideInTrending', {type: Sequelize.BOOLEAN, defaultValue: false});
        await queryInterface.addColumn('beam', 'hideInSelected', {type: Sequelize.BOOLEAN, defaultValue: false});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam', 'trendingWeight');
        await queryInterface.removeColumn('beam', 'selectedWeight');
        await queryInterface.removeColumn('beam', 'hideInSelected');
        await queryInterface.removeColumn('beam', 'hideInTrending');
    }
};