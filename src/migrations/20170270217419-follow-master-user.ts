'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        const masterUsers = await models.User.findAll({where: {isPermanentFollowing: true}});

        console.log(masterUsers);

        if(_.size(masterUsers) > 0) {

            const users = await models.User.findAll();

            const data = _.chain(users).map((user:any) => {
                return _.map(masterUsers, (masterUser:any) => {
                    return {
                        followerId: user.id,
                        followingId: masterUser.id,
                        status: models.Follow.statuses.ACCEPTED,
                        isPermanent: true
                    }
                });
            }).flatten().value();

            console.log(data);

            await models.Follow.bulkCreate(data);
        }
    },
    down: async function (queryInterface, Sequelize) {}
};