'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('content_update', {
            uuid: {
                type: Sequelize.BIGINT,
            },
            userId: {
                type: Sequelize.INTEGER,
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('content_update', ['userId', 'uuid'], {indexName: 'user_uuid_content_update_index'});
        await queryInterface.addIndex('content_update', ['uuid'], {indexName: 'uuid_content_update_index'});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeIndex('content_update', 'user_uuid_content_update_index');
        await queryInterface.removeIndex('content_update', 'uuid_content_update_index');

        await queryInterface.dropTable('content_update');
    }
};