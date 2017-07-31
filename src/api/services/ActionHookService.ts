'use strict';

import * as _ from 'lodash'
import AppError from './AppError'
import PermissionService from './auth/PermissionService'
import models from '../../models'
import logger from "../../config/logger";

const checkOwnerAccess = (ownerFieldName = 'userId') => {
    return function (ctx, instance) {

        const user = ctx.state.account;

        if (PermissionService.roleIsAdmin(user.role)) { return instance }

        if (!instance[ownerFieldName]) {
            logger.warn(`[ActionHookService] Field ${ownerFieldName} doesn't exist at model ${instance.getTableName()}`);
            return instance;
        }

        if (instance[ownerFieldName] != user.id) {throw new AppError(403, "Forbidden, you are not owner.")}

        return instance;
    }
};

const setOwner = (ownerFieldName = 'userId') => {
    return async function (ctx, instance) {

        const user = ctx.state.account;

        if (PermissionService.roleIsAdmin(user.role) && !_.isEmpty(instance[ownerFieldName])) { return true }

        instance[ownerFieldName] = user.id;

        return instance;
    }
};

const setDefaultStream = () => {

    return async function (ctx, instance) {

        const user = ctx.state.account;

        //if (PermissionService.roleIsAdmin(user.role)) { return true }

        if (!instance.streamId) {
            const stream = await models.Stream.findOne({
                where: {userId: instance.userId, type: models.Stream.types.PRIMARY},
                attributes: ['id']
            });
            instance.streamId = stream.id;
        }

        return instance;
    }
};

const checkPaidBeamsToPost = (userKeyId = 'state.account.id') => {

    return async function (ctx, instance) {

        const beamId = instance.beamId;

        const beams = await models.Beam.findAll({where: {id: {$in: beamId}, hasDonation: true}, attributes: ['id']});

        if (_.size(beams) > 0) {
            const beamIds = _.map(beams, 'id');
            const donations = await models.Donation.findAll({
                where: {
                    beamId: {$in: _.map(beams, 'id')},
                    userId: _.get(ctx, userKeyId),
                    type: models.Donation.types.DONATION
                }
            });

            const difference = _.difference(beamIds, _.map(donations, 'beamId'));

            if(_.size(difference)>0){throw new AppError(401, 'You can`t create post with paid beams, unless these are not purchased.')}
        }

        return instance;
    }
};


export default {
    checkOwnerAccess,
    setOwner,
    setDefaultStream,
    checkPaidBeamsToPost
}

