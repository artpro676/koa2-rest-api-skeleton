'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        const contents = await models.ContentKey.findAll();

        for (var i  in contents) {

            let data:any = {};
            if (contents[i].type == 'post') {
                data = {postId: contents[i].postId};
            } else {
                data = {beamId: contents[i].beamId};
            }

            const result = await models.ContentUpdate.update(data, {where: {uuid: contents[i].uuid}, silent: true});
            console.log(`${i}/${_.size(contents)} --- u ${contents[i].uuid} p ${result}  `)
        }
    },
    down: async function (queryInterface, Sequelize) {}
};