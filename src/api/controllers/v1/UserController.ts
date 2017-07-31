'use strict';

import config from '../../../config/app';
import logger from '../../../config/logger';
import models from '../../../models';
import AppError from '../../services/AppError';
import EmailService from '../../services/email/EmailService';
import ActionService from '../../services/ActionHookService';
import {roles} from '../../services/auth/PermissionService';
import GetList from '../../actions/GetList';
import Remove from '../../actions/Remove';

import * as _ from 'lodash';

/**
 * get /user
 * @param ctx
 */
const getUserList = async function (ctx) {

    const action = ctx.state.account.isAdmin()
        ? GetList('User')
        : GetList('User', {scopes: [
        {method: 'public', key: 'state.account.id'},
        {method: 'skipUser', key: 'state.account.id'},
        {method: 'skipBlocked', key: 'state.account.id'}
    ]});

    return action(ctx);
};

/**
 * put /user/bulk/status
 * @param ctx
 */
const setStatus = async function (ctx) {

    const idList = ctx.request.body.id;
    if (!_.isArray(idList)) {throw new AppError(400, 'Body ID should be an array.')}

    let status = ctx.request.body.status;
    if (!_.includes(models.User.statuses, status)) {
        throw new AppError(400, 'Status should be one of : ' + _.chain(models.User.statuses).values().join(' or ').value());
    }

    if (_.includes(idList, ctx.state.account.id)) {throw new AppError(400, 'You can`t change status of your profile')}

    let result = await models.User.update({status}, {where: {id: {$in: idList}}});
    ctx.body = {data: result};
};

/**
 *
 */
const processPublisherRequest = async function (ctx) {

    const user = ctx.state.user;

    if (user.role != roles.PUBLISHER_PENDING) {throw new AppError(400, "User doesn't have role 'pending publisher'")}

    let message = "";
    switch (_.toLower(ctx.params.action)) {
        case 'accept' :
            user.role = roles.PUBLISHER;
            message = "Your request is accepted";
            break;
        case 'reject' :
            user.role = roles.USER;
            message = "Your request is rejected";
            break;
        default:
            throw new AppError(400, "Unknown action '" + ctx.params.action + "'.")
    }

    await user.save();

    if (user.emailVerified) {
        await EmailService.sendTemplate('publisher_request_result', [user.email], {message});
    }

    ctx.body = {data: {message: "Request processed successful"}};
};

/**
 * post /user/:id/block
 */
const addToBlackList = async function (ctx) {

    if (ctx.state.account.id == ctx.state.user.id) { throw new AppError(400, 'You cannot block yourself') }

    const description = _.toString(ctx.request.body.description);
    const isFlagged = !!ctx.request.body.isFlagged;

    const data = {
        userId: ctx.state.account.id,
        accusedUserId: ctx.state.user.id,
        // isFlagged
    };

    const id = ctx.state.user.id;
    const userId = ctx.state.account.id;

    const [result, isCreated] = await models.UserBlackList.findOrCreate({
        where: data,
        defaults: _.merge({}, data, {description, isFlagged})
    });

    await models.Follow.destroy({
        where: {
            $or: [{followerId: id, followingId: userId}, {
                followerId: userId,
                followingId: id
            }]
        }
    });

    if(!isCreated){
        throw new AppError(409, 'User is already blocked(flagged)');
    } else {
        ctx.body = {data: result};

        if (isFlagged) {
            await EmailService.sendTemplate('user_block', config.email.supportEmails, {
                message: `User ${ctx.state.account.email} blocked user ${ctx.state.user.email}`
            });
        }
    }

};

/**
 * delete /user/:id/block
 */
const removeFromBlackList = async function (ctx) {

    const result = await models.UserBlackList.destroy({
        where: {
            userId: ctx.state.account.id,
            accusedUserId: ctx.state.user.id,
        }
    });

    ctx.body = {data: result};
};

/**
 * post|delete /user/:id/super_following
 */
const setPermanentFollowing = function(value) {
    return async function (ctx) {

        const user = ctx.state.account;
        user.isPermanentFollowing = value;
        user.save();

        ctx.body = {data: user};
    }
};

/**
 * delete /user/:id
 */
const deleteUser = async function(ctx) {
    const action = Remove('User', {before: [ActionService.checkOwnerAccess('id')]});

    if(_.get(ctx, 'request.body.description')){
        await models.User.update({
            deleteDescription: ctx.request.body.description
        }, {
            where: {id: ctx.params.id}
        });

        await EmailService.sendTemplate('alert', config.email.supportEmails, {
            title: `${ctx.state.account.fullname} has been removed`,
            message: ctx.request.body.description
        });
    }

    return action(ctx);
};

export default {
    setStatus,
    processPublisherRequest,
    addToBlackList,
    removeFromBlackList,
    getUserList,
    setPermanentFollowing,
    deleteUser
};