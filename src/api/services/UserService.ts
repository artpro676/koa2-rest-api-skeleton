'use strict';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as _ from 'lodash';
import * as Bluebird from 'bluebird';
import config from '../../config/app';
import AppError from './AppError';
import models from '../../models';

const dropRelatedRecords = async function (user) {
    await models.Beam.destroy({where: {userId: user.id}});
    await models.Post.destroy({where: {userId: user.id}});
    await models.Comment.destroy({where: {userId: user.id}});
    await models.ContentLike.destroy({where: {userId: user.id}});
    await models.ContentLinkHash.destroy({where: {userId: user.id}});
    // await  models.ContentUpdate.destroy({where: {userId: instance.id}});
    await models.Donation.destroy({where: {userId: user.id}});
    await models.Event.destroy({where: {userId: user.id}});
    await models.Follow.destroy({where: {$or: [{followerId: user.id}, {followingId: user.id}]}});
    await models.SavedContent.destroy({where: {userId: user.id}});
};


const creatPermanentFollow = async function (targetUser) {

    const superFollowings = await models.User.findAll({where: {isPermanentFollowing: true}});

    const data = _.map(superFollowings, (following:any) => {
        return {
            followerId: targetUser.id,
            followingId: following.id,
            status: models.Follow.statuses.ACCEPTED
        }
    });

    return models.Follow.bulkCreate(data);
};


const recoverProfile = function(user){
    return models.sequelize.query(`
        UPDATE "${models.User.getTableName()}" SET "deletedAt" = NULL WHERE "id" = ${user.id};
        UPDATE "${models.Beam.getTableName()}" SET "deletedAt" = NULL WHERE "userId" = ${user.id};
        UPDATE "${models.Post.getTableName()}" SET "deletedAt" = NULL WHERE "userId" = ${user.id};
        UPDATE "${models.Comment.getTableName()}" SET "deletedAt" = NULL WHERE "userId" = ${user.id};           
        UPDATE "${models.Donation.getTableName()}" SET "deletedAt" = NULL WHERE "userId" = ${user.id};
        UPDATE "${models.Event.getTableName()}" SET "deletedAt" = NULL WHERE "userId" = ${user.id};
        UPDATE "${models.SavedContent.getTableName()}" SET "deletedAt" = NULL WHERE "userId" = ${user.id};
    `);
};

export default {
    dropRelatedRecords,
    creatPermanentFollow,
    recoverProfile
}