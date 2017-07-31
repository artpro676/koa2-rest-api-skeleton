'use strict';

import config from '../../../config/app';
import models from '../../../models';
import * as _ from 'lodash';
import AppError from '../AppError';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as Bluebird from 'bluebird';

/**
 * Creates reset pass token.
 *
 * @param user
 * @param expiresIn
 */
const createResetPasswordToken = async function (user, expiresIn = config.token.resetPassword.expiresIn) {
    return createToken(user.id, models.Token.types.RESET_PASSWORD_TOKEN, expiresIn)
};

/**
 * Creates confirm signup token.
 *
 * @param user
 * @param expiresIn
 * @returns {Promise<()=>T>}
 */
const createConfirmationToken = async function (user, expiresIn = config.token.confirmSignup.expiresIn) {
    return createToken(user.id, models.Token.types.SIGNUP_CONFIRMATION_TOKEN, expiresIn)
};

/**
 * Creates notification disable token.
 *
 * @param user
 * @param expiresIn
 * @returns {Promise<()=>T>}
 */
const createNotificationDisableToken = async function (user, expiresIn = config.token.disableNotification.expiresIn) {
    return createToken(user.id, models.Token.types.NOTIFICATION_DISABLE_TOKEN, expiresIn)
};

/**
 * Creates refresh token.
 *
 * @param user
 * @param expiresIn
 * @returns {Promise<()=>T>}
 */
const createRefreshToken = async function (user, authType = '', expiresIn = config.token.refreshToken.expiresIn) {
    return createToken(user.id, models.Token.types.REFRESH_TOKEN, expiresIn, authType)
};

/**
 * Universal method for creation tokens.
 *
 * @param userId
 * @param type
 * @param expiresIn
 * @returns {()=>T}
 */
async function createToken(userId, type, expiresIn, authType = '') {
    const where = {userId, type, authType};

    await models.Token.destroy({where: {expiresAt: {$lt: new Date()}}});

    const token = await models.Token.create(_.set(where, 'expiresAt', new Date(Date.now() + (expiresIn * 1000))));

    return token.value;
}

/**
 * Refresh AuthToken and RefreshToken.
 *
 * @param refreshToken
 * @returns {{authToken: any, refreshToken: any}}
 */
const refreshAuthToken = async function (refreshToken) {

    if (_.isEmpty(refreshToken)) {throw new AppError(400, 'Refresh token is required.')}

    let token = await models.Token.findOne({
        where: {
            value: refreshToken,
            type: models.Token.types.REFRESH_TOKEN,
            expiresAt: {$gt: new Date()}
        },
        include: [{model: models.User, as: 'user'}]
    });

    if (!token || !token.user) throw new AppError(400, 'Refresh token is invalid or expired.');

    if (token.user.isDisabled()) throw new AppError(403, 'Account is currently disabled, please contact customer support.');

    const authToken = signJwtToken({
        id: token.user.id,
        email: token.user.email,
        authType: token.authType
    });

    const newRefreshToken = await createRefreshToken(token.user, token.authType);

    await token.destroy();

    return {authToken, refreshToken: newRefreshToken};
};

/**
 * Create JWT token for spec user.
 *
 * @param data
 * @param secret
 * @param options
 * @returns {string}
 */
const signJwtToken = function (data, secret = config.jwt.secret, options = {
    expiresIn: config.jwt.expiresIn,
    issuer: config.jwt.issuer
}) {
    return jwt.sign(data, secret, options);
};

/**
 * Validating JWT toke.
 *
 * @param token
 * @param secret
 * @returns {Bluebird}
 */
const verifyJwtToken = async function (token, secret = config.jwt.secret) {
    return new Bluebird(function (resolve, reject) {
        jwt.verify(token, secret, function (err, decoded) {

            if (err && err.name === 'TokenExpiredError') {
                return reject(new AppError(401, 'Token is expired'));
            }

            if ((err && err.name === 'JsonWebTokenError') || !decoded) {
                return reject(new AppError(401, 'Token is not valid'));
            }

            return resolve(decoded);
        });
    });
};

export default {
    createNotificationDisableToken,
    createResetPasswordToken,
    createConfirmationToken,
    createRefreshToken,
    refreshAuthToken,
    verifyJwtToken,
    signJwtToken
};
