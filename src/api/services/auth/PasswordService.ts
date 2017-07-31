'use strict';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as Bluebird from 'bluebird';
import config from '../../../config/app';
import logger from '../../../config/logger';
import AppError from '../AppError';
import * as Ajv from 'ajv';
import * as _ from 'lodash';
import NotificationService from '../NotificationService';
import models from '../../../models';

/**
 * Generate a hash from plain password
 *
 * @param password
 */
const hashPassword = async function (password) {
    return new Bluebird(function (resolve, reject) {

        if(!password){ return resolve("") }

        bcrypt.genSalt(config.saltFactor, function (err, salt) {
            if (err) return reject(err);

            bcrypt.hash(password, salt, function (err, hash) {
                if (err) return reject(err);
                return resolve(hash);
            });
        });
    });
};

/**
 * Compare a password provided from user and real current password hash.
 *
 * @param password
 * @param passwordHash
 */
const comparePasswords = async function (password, passwordHash) {
    return new Bluebird(function (resolve, reject) {
        bcrypt.compare(password, passwordHash, function (err, valid) {
            if (err) return reject(err);
            return resolve(valid);
        });
    });
};



/**
 * post /v1/account/resetPassword
 */
const requestResetPassword = async function (email) {

    if (!email) {throw new AppError(400, 'Email is required')}

    let user = await models.User.findOne({where: {email}});

    if (!user) throw new AppError(404, 'There is no account for that Email.');

    await NotificationService.sendResetPasswordEmail(user);

    logger.silly(`User requested reset password with email : ${user.email}`)

    return true;
};

/**
 * post /setPassword
 */
const resetPassword = async function (password, resetPasswordToken) {

    if (_.isEmpty(password)) {throw new AppError(400, 'Password is required.')}

    if (_.isEmpty(resetPasswordToken)) {throw new AppError(400, 'Refresh token is required.')}

    let token = await models.Token.findOne({
        where: {
            value: resetPasswordToken,
            type: models.Token.types.RESET_PASSWORD_TOKEN,
            expiresAt: {$gt: new Date()}
        },
        include: [{model: models.User, as: 'user'}]
    });

    if (!token || !token.user) throw new AppError(400, 'Reset token is invalid or expired.');

    const user = token.user;

    if (user.isDisabled()) throw new AppError(403, 'Account is currently disabled, please contact customer support.');

    //await models.User.update({password}, {where: {id: token.user.id}});

    user.password = password;
    await user.save();
    await models.Token.destroy({where: {userId: user.id, type: 'reset_password_token'}});

    logger.silly(`User did updated password with email : ${token.user.email}`);

    return true
};

export default {
    comparePasswords,
    hashPassword,
    resetPassword,
    requestResetPassword
};