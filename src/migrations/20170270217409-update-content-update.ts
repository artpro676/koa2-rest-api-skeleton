'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await models.ContentUpdate.destroy({truncate: true});
        console.log('truncated');

        const contents = await models.ContentKey.findAll({attributes: ['uuid']});
        const contentSize = _.size(contents);
        console.log(`Found ${contentSize} content_key records`);

        const users = await models.User.findAll({attributes: ['id']});
        console.log(`Found ${_.size(users)} user records`);

        for (var i in contents) {
            const data = _.map(users, function (user:any) {
                return {
                    uuid: contents[i].uuid,
                    userId: user.id
                }
            });

            await models.ContentUpdate.bulkCreate(data);
            console.log(`${i}/${contentSize} - Created contentUpdate for content ${contents[i].uuid}`);
        }

    },
    down: async function (queryInterface, Sequelize) {
    }
};