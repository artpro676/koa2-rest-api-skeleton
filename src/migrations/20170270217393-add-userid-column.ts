'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('content_key', 'userId', {type: Sequelize.INTEGER});

        const beams = await models.Beam.findAll({attributes:['id', 'userId']});
        const posts = await models.Post.findAll({attributes:['id', 'userId']});

        for (var i in beams){
            await models.ContentKey.update({userId: beams[i].userId}, {where: { beamId: beams[i].id}})
        }

        for (var i in posts){
            await models.ContentKey.update({userId: posts[i].userId}, {where: { postId: posts[i].id}})
        }

    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('content_key', 'userId');
    }
};