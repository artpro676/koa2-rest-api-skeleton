'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('content_key', {
            uuid: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
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

        let newRecords = [];

        const beams = await models.Beam.findAll();
        const posts = await models.Post.findAll();

        _.each(beams, (beam) => { newRecords.push({beamId: beam.id})});
        _.each(posts, (post) => { newRecords.push({postId: post.id})});

        models.ContentKey.bulkCreate(newRecords);
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.dropTable('content_key');
    }
};