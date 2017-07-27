'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('content_upload', {
            uuid: {
                type: Sequelize.BIGINT,
            },
            userId: {
                type: Sequelize.INTEGER,
            },
            beamId: {
                type: Sequelize.INTEGER,
            },
            postId: {
                type: Sequelize.INTEGER,
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        });

        await queryInterface.removeColumn('post', 'pushedToDevice');
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('post', 'pushedToDevice', {type: Sequelize.BOOLEAN, defaultValue: false});
        await queryInterface.dropTable('content_upload');
    }
};