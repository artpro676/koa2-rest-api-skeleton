'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        // await queryInterface.addColumn('user_black_list', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});
        await queryInterface.addColumn('beam_black_list', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('user_black_list', 'id');
        await queryInterface.removeColumn('beam_black_list', 'id');
    }
};