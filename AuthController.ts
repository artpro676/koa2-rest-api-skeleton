'use strict';

import * as _ from 'lodash';
import * as moment from 'moment';
import * as Ajv from 'ajv';
import AppError from '../../services/AppError';
import AuthService from '../../services/AuthService';
import EmailService from '../../services/EmailService';
import SocialService from '../../services/SocialService';
import UserService from '../../services/UserService';
import MobileDeviceService from '../../services/MobileDeviceService';
import TokenService from '../../services/TokenService';
import NotificationService from '../../services/NotificationService';
import Utils from '../../services/Utils';
//import logger from '../../../config/logger';
import models from '../../../models';
import logger from "../../../config/logger";
import config from "../../../config/app";
import {get} from "http";

const ajv = Ajv({allErrors: true});

const authCases = {
    email: models.Token.authTypes.EMAIL,
    facebook: models.Token.authTypes.SOCIAL_FACEBOOK,
    twitter: models.Token.authTypes.SOCIAL_TWITTER,
};

const signupSchema = {
    type: 'object',
    properties: {
        firstName: {type: 'string'},
        lastName: {type: 'string'},
        username: {type: 'string'},
        email: {type: 'string', format: 'email'},
        password: {
            type: ['string', 'integer'],
            minLength: 4
        },
        pictureName: {type: 'string'},
        description: {type: 'string'},
        dob: {type: 'string'},
        gender: {type: 'string'},
    },
    //additionalProperties: false,
    required: ['email', 'password', 'dob']
};

const signinSchema = {
    type: 'object',
    properties: {
        email: {type: 'string', format: 'email'},
        password: {
            type: ['string', 'integer'],
            minLength: 4
        },
        device: {
            type: ["object", "null"],
            patternProperties: {
                "^(uuid|platform|token)$": {type: "string"}
            },
            additionalProperties: false
        }
    },
    additionalProperties: false,
    required: ['email', 'password']
};


const signinSocialSchema = {
    type: 'object',
    properties: {
        email: {type: 'string', format: 'email'},
        device: {
            type: ["object", "null"],
            patternProperties: {
                "^(uuid|platform|token)$": {type: "string"}
            },
            additionalProperties: false
        },
        provider: {enum: ['facebook', 'twitter']},
        token: {type: 'string'},
        secretToken: {type: 'string'},
    },
    additionalProperties: false,
    required: ['email', 'token']
};

async function createTokens(user, provider = 'email') {
    const userJSON = user.toJSON();

    const authType = _.get(authCases, provider, models.Token.authTypes.EMAIL);

    userJSON.authToken = AuthService.signToken({
        id: user.id,
        email: user.email,
        authType,
    });
    userJSON.refreshToken = await TokenService.createRefreshToken(user, authType);

    return userJSON;
}


/**
 * POST /signin/:provider
 */
const signinSocial = async function (ctx) {

    let data = ctx.request.body;
    data.provider = ctx.params.provider;

    let validCredentials = ajv.validate(signinSocialSchema, data);
    if (!validCredentials) {throw new AppError(400, ajv.errorsText(), ajv.errors.toString())}

    let [user, isNewUser] = await models.User.findOrCreate({
        where: {email: data.email},
        defaults: {email: data.email},
        paranoid: false
    });

    if (user) {
        if (user.isDisabled()) {throw new AppError(403, 'Account is currently disabled, please contact customer support.')}
        if (user.deletedAt != null) {await UserService.recoverProfile(user)}
    }

    const authId = await SocialService.getClientId(user, data.provider, data.token, data.secretToken);

    if (isNewUser) { await NotificationService.sendConfirmationEmail(user); }

    const userAuthData = {userId: user.id, provider: data.provider};
    const [userAuth, isNewUserAuth] = await models.UserAuth.findOrCreate({
        where: userAuthData, defaults: _.set(userAuthData, 'authId', authId.toString()),
    });

    if (!isNewUser && !isNewUserAuth && userAuth.authId != authId) throw new AppError(400, 'Access token isn`t valid.');

    if (data.device) {
        try {
            await MobileDeviceService.assignToUser(data.device, user.id)
        } catch (e) {
            logger.error(e);
        }
    }

    user = await createTokens(user, ctx.params.provider);

    ctx.body = {data: user};

    logger.silly(`User signin with email : ${user.email}`)
};

/**
 * post /v1/signin
 */
const signin = async function (ctx) {
    let data = ctx.request.body;

    let validCredentials = ajv.validate(signinSchema, data);
    if (!validCredentials) {throw new AppError(400, ajv.errorsText(), ajv.errors.toString())}

    let user = await models.User.findOne({where: {email: data.email}});

    if (!user) throw new AppError(400, `User with email ${data.email} doesn't exist.`);
    if (user.isDisabled()) throw new AppError(403, 'Account is currently disabled, please contact customer support.');

    let valid = await AuthService.comparePasswords(data.password, user.password);
    if (!valid) throw new AppError(400, 'Email or password is wrong.');

    if (data.device) {
        try {
            await MobileDeviceService.assignToUser(data.device, user.id)
        } catch (e) {
            logger.error(e);
        }
    }

    user = await createTokens(user);

    ctx.body = {data: user};

    logger.silly(`User signin with email : ${user.email}`)
};

/**
 * post /v1/signup
 */
const signup = async function (ctx) {
    let data:any = ctx.request.body;

    if (_.isEmpty(data.dob)){ throw new AppError(400, `Empty field 'Date of Birth'`)}

    let valid = ajv.validate(signupSchema, data);
    if (!valid) {throw new AppError(400, ajv.errorsText(), ajv.errors.toString())}

    // validate age of user before signup
    const now = moment(new Date());
    const end = moment(data.dob);
    const duration = moment.duration(now.diff(end));
    const years = duration.asYears();

    if (years < config.minAllowedAge) {throw new AppError(403, `You should be older than ${config.minAllowedAge}.`)}

    let user = await models.User.findOne({where: {email: data.email}, paranoid: false});

    let created:any = {};

    if (user) {
        if (user.deletedAt != null) {
            await UserService.recoverProfile(user);
            created = user;
        } else {
            throw new AppError(400, `User with email ${data.email} already exists.`)
        }
    } else {
        created = await models.User.create(data);
    }

    if (!created.emailVerified) { await NotificationService.sendConfirmationEmail(created) }

    user = await createTokens(created);

    ctx.body = {data: user};

    logger.silly(`User signup with email : ${created.email}`)
};

/**
 * post /v1/signup/confirm/
 */
const signupConfirmation = async function (ctx) {
    const confirmToken = ctx.request.body.token;

    if (_.isEmpty(confirmToken)) {throw new AppError(400, 'Refresh token is required.')}

    let token = await models.Token.findOne({
        where: {
            value: confirmToken,
            type: models.Token.types.SIGNUP_CONFIRMATION_TOKEN,
            expiresAt: {$gt: new Date()}
        },
        include: [{model: models.User, as: 'user'}]
    });

    if (!token || !token.user) throw new AppError(400, 'Confirmation token is invalid or expired.');

    await models.User.update({
        // status: models.User.statuses.ENABLED,
        emailVerified: true
    }, {where: {id: token.user.id}});

    await models.Token.destroy({where: {userId: token.user.id, type: 'confirmation_token'}});

    ctx.body = {data: {message: "Thanks for your confirmation. Now you can try to sign in."}};

    logger.silly(`User confirmed signup with email : ${token.user.email}`)
};

/**
 * post /v1/notification/disable
 */
const notificationDisableConfirmation = async function (ctx) {
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

    await models.User.update({
        enableNotification: false
    }, {where: {id: token.user.id}});

    await models.Token.destroy({where: {userId: token.user.id, type: 'notification_disable_token'}});

    ctx.body = {data: {message: "Notifications disabled"}};

    logger.silly(`User disabled notifications with email : ${token.user.email}`)
};

/**
 * post /v1/account/resetPassword
 */
const resetPassword = async function (ctx) {
    let email = ctx.params.email;

    if (!email) {throw new AppError(400, 'Email is required')}

    let user = await models.User.findOne({where: {email}});

    if (!user) throw new AppError(404, 'There is no account for that Email.');

    await NotificationService.sendResetPasswordEmail(user);

    ctx.body = {data: {message: 'Please check your mailbox'}};

    logger.silly(`User requested reset password with email : ${user.email}`)
};

/**
 * post /setPassword
 */
const setPassword = async function (ctx) {
    const password = ctx.request.body.password;

    if (_.isEmpty(password)) {throw new AppError(400, 'Password is required.')}

    const resetPasswordToken = Utils.getAuthorizationToken(ctx);

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

    ctx.body = {data: {message: 'Ok, Try to signin'}};

    logger.silly(`User did updated password with email : ${token.user.email}`)
};

/**
 * post /refresh_token
 */
const refreshToken = async function (ctx) {
    const refreshToken = ctx.request.body.token;

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

    const authToken = AuthService.signToken({
        id: token.user.id,
        email: token.user.email,
        authType: token.authType
    });

    const newRefreshToken = await TokenService.createRefreshToken(token.user, token.authType);

    await token.destroy();

    ctx.body = {data: {authToken, refreshToken: newRefreshToken}};
};


export default {
    signin,
    signinSocial,
    signup,
    refreshToken,
    resetPassword,
    setPassword,
    signupConfirmation,
    notificationDisableConfirmation
};