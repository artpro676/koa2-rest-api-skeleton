'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.renameTable('beam_share', 'content_share');
        await queryInterface.addColumn('content_share', 'postId', {type: Sequelize.INTEGER});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('content_share', 'postId');
        await queryInterface.renameTable('content_share', 'beam_share');
    }
};