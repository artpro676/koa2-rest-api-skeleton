'use strict';

import models from '../models';
import * as _ from 'lodash';

const modelName = [
    'Appeal',
    'AppealPair',
    'Beam',
    'BeamBlackList',
    'BeamDevice',
    'BeamFollow',
    'Category',
    'Comment',
    'ContentKey',
    'ContentLike',
    'ContentLinkHash',
    'ContentShare',
    'Donation',
    'EmailBlacklist',
    'Event',
    'Follow',
    'Interest',
    'Library',
    'MobileDevice',
    'Plan',
    'Post',
    'SavedContent',
    'Stream',
    'Subscription',
    'Tag',
    'Token',
    'User',
    'UserAuth',
    'UserBlackList'
];

module.exports = {
    up: async function (queryInterface, Sequelize) {
        for (var i in modelName) {
            const tableName = models[modelName[i]].tableName;

            let columns = ['id'];
            if (tableName == 'content_key') {
                columns = ['uuid'];
            }
            await queryInterface.addIndex(tableName, columns, {indexName: tableName + '_id_index'});
        }
    },
    down: async function (queryInterface, Sequelize) {
        for (var i in modelName) {
            const tableName = models[modelName[i]].tableName;
            await queryInterface.removeIndex(tableName, tableName + '_id_index');
        }
    }
};