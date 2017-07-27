'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await models.sequelize.query(`ALTER TABLE post_black_list ALTER COLUMN "postId" TYPE BIGINT`);
    },
    down: async function (queryInterface, Sequelize) {
    }
};