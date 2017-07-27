'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('content_update', 'beamId', {type: Sequelize.INTEGER});
        await queryInterface.addColumn('content_update', 'postId', {type: Sequelize.INTEGER});

        await queryInterface.addIndex('content_update', ['beamId'], {indexName: 'beamid_content_update_index'});
        await queryInterface.addIndex('content_update', ['postId'], {indexName: 'postid_content_update_index'});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeIndex('content_update', 'beamid_content_update_index');
        await queryInterface.removeIndex('content_update', 'postid_content_update_index');

        await queryInterface.removeIndex('content_update', 'beamId');
        await queryInterface.removeIndex('content_update', 'postId');
    }
};