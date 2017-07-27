'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam', 'recommendedAt', {type: Sequelize.DATE});
        await queryInterface.addColumn('beam', 'isRecommended', {type: Sequelize.BOOLEAN});

        await queryInterface.addIndex('beam', ['isRecommended', 'recommendedAt'], {indexName: 'beam_recommended_index'});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeIndex('beam', 'beam_recommended_index');

        await queryInterface.removeColumn('beam', 'recommendedAt');
        await queryInterface.removeColumn('beam', 'isRecommended');
    }
};