'use strict';

import GetOne from '../../actions/GetOne';
import GetList from '../../actions/GetList';
import config from '../../../config/app';
import logger from '../../../config/logger';
import models from '../../../models';
import AppError from '../../services/AppError';
import {roles} from '../../services/RoleService';
import MobileDeviceService from '../../services/MobileDeviceService';
import EmailService from '../../services/EmailService';
import QueryFilterService from '../../services/QueryFilterService';
import BeamDeviceService from '../../services/BeamDeviceService';
import * as Ajv from 'ajv';
import * as _ from 'lodash';
import * as Bluebird from "bluebird";

const ajv = Ajv({allErrors: true});

/**
 * POST /account/auth/:provider
 */
const setUserAuth = (userIdKey) => {

    return async function (ctx) {

        const userId = _.get(ctx, userIdKey);

        const where = {userId, provider: ctx.params.provider};
        const userAuthData = _.merge({authId: ctx.request.body.authId}, where);
        const providers = models.UserAuth.providers;

        if (!ctx.params.provider || !_.includes(providers, ctx.params.provider)) {
            throw new AppError(400, 'Invalid provider name');
        }

        let valid = ajv.validate(models.UserAuth.schema, userAuthData);
        if (!valid) {throw new AppError(400, ajv.errorsText(), ajv.errors.toString())}

        const userAuth = await models.UserAuth.findOrCreate({where, defaults: userAuthData});

        if (!userAuth[1] || (userAuthData.authId != userAuth[0].authId)) {
            userAuth[0].authId = userAuthData.authId;
            await userAuth[0].save();
        }

        ctx.body = {data: userAuth[0]};

        if (ctx.request.body.token && _.isObject(ctx.request.body.token)) {
            const types = models.Token.types;
            let tokens = [];
            switch (ctx.params.provider) {
                case providers.FACEBOOK:
                    tokens.push({
                        value: ctx.request.body.token.auth,
                        userAuthId: userAuth[0].id,
                        userId: userId,
                        type: types.FACEBOOK_AUTH_TOKEN,
                        expiresAt: ctx.request.body.token.expiresAt,
                    });
                    break;
                case providers.TWITTER:
                    tokens = [{
                        value: ctx.request.body.token.auth,
                        userAuthId: userAuth[0].id,
                        userId,
                        type: types.TWITTER_AUTH_TOKEN,
                        expiresAt: new Date(Date.now() + (3600 * 1000 * 24 * 365))
                    }, {
                        value: ctx.request.body.token.authSecret,
                        userAuthId: userAuth[0].id,
                        userId,
                        type: types.TWITTER_AUTH_SECRET_TOKEN,
                        expiresAt: new Date(Date.now() + (3600 * 1000 * 24 * 365))
                    }];
                    break;
            }

            if (_.size(tokens)) {
                await models.Token.destroy({where: {type: {$in: _.map(tokens, 'type')}, userId}});
                await models.Token.bulkCreate(tokens);
            }
        }
    }
};

/**
 * GET /account/auth/:provider
 */
const getUserAuth = (userIdKey) => {

    return async function (ctx) {

        const userId = _.get(ctx, userIdKey);

        const query = QueryFilterService.parseAll(ctx, models.UserAuth);

        const scopes = [
            {method: ['byUserId', userId]},
            {method: ['byProvider', ctx.params.provider]},
        ];

        const auth = await models.UserAuth.scope(scopes).findOne(query);

        if (!auth) {throw new AppError(404, 'Not found')}

        ctx.body = {data: auth}
    }
};

/**
 * DELETE /account/auth/:provider
 */
const removeUserAuth = (userIdKey) => {

    return async function (ctx) {

        const userId = _.get(ctx, userIdKey);

        const scopes = [
            {method: ['byUserId', userId]},
            {method: ['byProvider', ctx.params.provider]},
        ];

        const auth = await models.UserAuth.scope(scopes).findOne({attributes: ['id']});

        if (!auth) { throw new AppError(400, `Instance of userAuth for provider "${ctx.params.provider}" already is removed.`)}

        await models.Token.destroy({where: {userId: userId, userAuthId: auth.id}});
        await auth.destroy();

        ctx.body = {data: {count: 1}};
    }
};

export default {
    setUserAuth,
    getUserAuth,
    removeUserAuth
};