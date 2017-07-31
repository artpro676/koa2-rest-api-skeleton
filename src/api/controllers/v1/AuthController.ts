'use strict';

import * as _ from 'lodash';
import * as moment from 'moment';
import * as Ajv from 'ajv';
import AppError from '../../services/AppError';
import TokenService from '../../services/auth/TokenService';
import AuthService from '../../services/auth/AuthService';
import PasswordService from '../../services/auth/PasswordService';
import Utils from '../../services/Utils';
import models from '../../../models';
import logger from "../../../config/logger";

/**
 * POST /signin/:provider
 */
const signinSocial = async function (ctx) {

    let data = ctx.request.body;
    data.provider = ctx.params.provider;

    let user = await AuthService.socialSignin(data);

    ctx.body = {data: user};

    logger.silly(`User signin with email : ${user.email}`)
};

/**
 * post /v1/signin
 */
const signin = async function (ctx) {

    let data = ctx.request.body;

    let user = await AuthService.signin(data);

    ctx.body = {data: user};

    logger.silly(`User signin with email : ${user.email}`)
};

/**
 * post /v1/signup
 */
const signup = async function (ctx) {

    let data:any = ctx.request.body;

    let user = await AuthService.signup(data);

    ctx.body = {data: user};

    logger.silly(`User signup with email : ${user.email}`)
};

/**
 * post /v1/signup/confirm/
 */
const signupConfirmation = async function (ctx) {

    await AuthService.signupConfirmation(ctx.request.body.token);

    ctx.body = {data: {message: "Thanks for your confirmation. Now you can try to sign in."}};
};

/**
 * post /v1/notification/disable
 */
const emailNotificationDisableConfirmation = async function (ctx) {

    const confirmToken = ctx.request.body.token;

    if (_.isEmpty(confirmToken)) {throw new AppError(400, 'Notification disable token is required.')}

    let token = await models.Token.findOne({
        where: {
            value: confirmToken,
            type: models.Token.types.NOTIFICATION_DISABLE_TOKEN,
            expiresAt: {$gt: new Date()}
        },
        include: [{model: models.User, as: 'user'}]
    });

    if (!token || !token.user) throw new AppError(400, 'Notification disable token is invalid or expired.');

    await models.User.update({enableNotification: false}, {where: {id: token.user.id}});

    await models.Token.destroy({where: {userId: token.user.id, type: 'notification_disable_token'}});

    ctx.body = {data: {message: "Notifications disabled"}};

    logger.silly(`User disabled notifications with email : ${token.user.email}`)
};

/**
 * post /v1/resetPassword
 */
const requestResetPassword = async function (ctx) {

    await PasswordService.requestResetPassword(ctx.params.email);

    ctx.body = {data: {message: 'Please check your mailbox'}};
};

/**
 * post /v1/setPassword
 */
const resetPassword = async function (ctx) {

    const resetPasswordToken = Utils.getAuthorizationToken(ctx);

    await PasswordService.resetPassword(ctx.request.body.password, resetPasswordToken);

    ctx.body = {data: {message: 'Ok, Try to signin'}};
};

/**
 * post /refresh_token
 */
const refreshToken = async function (ctx) {

    const result = await TokenService.refreshAuthToken(ctx.request.body.token);

    ctx.body = {data: result};
};


export default {
    signin,
    signinSocial,
    signup,
    refreshToken,
    resetPassword,
    requestResetPassword,
    signupConfirmation,
    emailNotificationDisableConfirmation
};