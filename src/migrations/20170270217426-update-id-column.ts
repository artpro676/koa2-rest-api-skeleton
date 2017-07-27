'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {

        await models.sequelize.transaction(async function(transaction){

            await models.sequelize.query(`ALTER TABLE event ALTER COLUMN targetId TYPE BIGINT`, {transaction});

            await models.sequelize.query(`ALTER TABLE beam ALTER COLUMN id TYPE BIGINT`, {transaction});

            await models.sequelize.query(`ALTER TABLE post ALTER COLUMN id TYPE BIGINT`, {transaction});
            await models.sequelize.query(`ALTER TABLE post ALTER COLUMN "beamId" TYPE BIGINT[]`, {transaction});

            await models.sequelize.query(`ALTER TABLE beam_black_list ALTER COLUMN "beamId" TYPE BIGINT`, {transaction});

            await models.sequelize.query(`ALTER TABLE beam_follow ALTER COLUMN "beamId" TYPE BIGINT`, {transaction});

            await models.sequelize.query(`ALTER TABLE comment ALTER COLUMN "beamId" TYPE BIGINT`, {transaction});
            await models.sequelize.query(`ALTER TABLE comment ALTER COLUMN "postId" TYPE BIGINT`, {transaction});

            await models.sequelize.query(`ALTER TABLE content_key ALTER COLUMN "beamId" TYPE BIGINT`, {transaction});
            await models.sequelize.query(`ALTER TABLE content_key ALTER COLUMN "postId" TYPE BIGINT`, {transaction});

            await models.sequelize.query(`ALTER TABLE content_like ALTER COLUMN "beamId" TYPE BIGINT`, {transaction});
            await models.sequelize.query(`ALTER TABLE content_like ALTER COLUMN "postId" TYPE BIGINT`, {transaction});

            await models.sequelize.query(`ALTER TABLE content_link_hash ALTER COLUMN "beamId" TYPE BIGINT`, {transaction});
            await models.sequelize.query(`ALTER TABLE content_link_hash ALTER COLUMN "postId" TYPE BIGINT`, {transaction});

            await models.sequelize.query(`ALTER TABLE content_share ALTER COLUMN "beamId" TYPE BIGINT`, {transaction});
            await models.sequelize.query(`ALTER TABLE content_share ALTER COLUMN "postId" TYPE BIGINT`, {transaction});

            await models.sequelize.query(`ALTER TABLE content_update ALTER COLUMN "beamId" TYPE BIGINT`, {transaction});
            await models.sequelize.query(`ALTER TABLE content_update ALTER COLUMN "postId" TYPE BIGINT`, {transaction});

            await models.sequelize.query(`ALTER TABLE content_upload ALTER COLUMN "beamId" TYPE BIGINT`, {transaction});
            await models.sequelize.query(`ALTER TABLE content_upload ALTER COLUMN "postId" TYPE BIGINT`, {transaction});

            await models.sequelize.query(`ALTER TABLE saved_content ALTER COLUMN "beamId" TYPE BIGINT`, {transaction});
            await models.sequelize.query(`ALTER TABLE saved_content ALTER COLUMN "postId" TYPE BIGINT`, {transaction});

        });
    },
    down: async function (queryInterface, Sequelize) {
    }
};