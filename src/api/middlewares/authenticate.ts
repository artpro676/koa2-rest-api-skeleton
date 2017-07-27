'use strict';

import Utils from '../services/Utils';
import TokenService from '../services/TokenService';
import AppError from '../services/AppError';
import models from '../../models';
import logger from "../../config/logger";
import * as _ from 'lodash';
import config from "../../config/app";

/**
 * Check authorization token
 * @param ctx
 * @param next
 * @returns {*}
 */
const authenticate = async function (ctx, next) {
    let token = Utils.getAuthorizationToken(ctx);

    if (!token) {
        logger.info("User isn`t authenticated");
        return next();
    }

    // if (!token) {
    // 	ctx.status = 403;
    // 	ctx.body = {
    // 		error: {
    // 			message: 'Access token is required!'
    // 		}
    // 	};
    // 	return;
    // }

    let decoded;
    try {
        decoded = await TokenService.verifyJWTToken(token);
    } catch (err) {
        throw new AppError(401, err.message);
    }

    let account = await models.User.find({where: {email: decoded.email}});

    if (!account) {throw new AppError(400, 'Email doesn`t exist for this token')}

    if(account.isDisabled()){throw new AppError(403, 'Account is currently disabled, please contact customer support.')}

    _.set(ctx, 'state.user', account);

    if(config.stage != 'master') {
        logger.silly('Context parameters : ' + JSON.stringify(_.merge({}, _.pick(ctx.request, ['query', 'body', 'params']), {header: ctx.header})));
    }

    return next();
};

export default authenticate;