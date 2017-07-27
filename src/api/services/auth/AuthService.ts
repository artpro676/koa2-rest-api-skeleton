'use strict';

import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as Bluebird from 'bluebird';
import config from '../../config/app';
import AppError from '../AppError';
import * as Ajv from 'ajv';
import NotificationService from '../NotificationService';
import models from '../../../models';
import PasswordService from './PasswordService';

const ajv = Ajv({allErrors: true});

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

/**
 * Process signin flow.
 * Case : email + password
 *
 * @param data
 * @returns {any}
 */
const signin = async function (data:any) {

    if (!data) { throw new AppError(500, 'Authorization data shouldn`t be empty.') }

    let validCredentials = ajv.validate(signinSchema, data);
    if (!validCredentials) {throw new AppError(400, ajv.errorsText(), ajv.errors.toString())}

    let user = await models.User.findOne({where: {email: data.email}});

    if (!user) throw new AppError(400, `User with email ${data.email} doesn't exist.`);
    if (user.isDisabled()) throw new AppError(403, 'Account is currently disabled, please contact customer support.');

    let valid = await PasswordService.comparePasswords(data.password, user.password);
    if (!valid) throw new AppError(400, 'Email or password is wrong.');

    if (data.device) {
        try {
            await MobileDeviceService.assignToUser(data.device, user.id)
        } catch (e) {
            logger.error(e);
        }
    }

    return createTokens(user);
};

async function createTokens(user, provider = 'email') {

    const authCases = {
        email: models.Token.authTypes.EMAIL,
        facebook: models.Token.authTypes.SOCIAL_FACEBOOK,
        twitter: models.Token.authTypes.SOCIAL_TWITTER,
    };

    const userJSON = user.toJSON();

    const authType = _.get(authCases, provider, models.Token.authTypes.EMAIL);

    userJSON.authToken = TokenService.signJwtToken({id: user.id, email: user.email, authType});
    userJSON.refreshToken = await TokenService.createRefreshToken(user, authType);

    return userJSON;
}

/**
 * Process signin flow.
 * Case : twitter/facebook
 *
 * @param data
 * @returns {any}
 */
const socialSignin = async function (data:any, provider) {

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

    return createTokens(user, data.provider);
};


/**
 * Process signup flow.
 * Case : email + password
 *
 * @param data
 * @returns {any}
 */
const signup = async function (data:any) {

    if (!data) { throw new AppError(500, 'Authorization data shouldn`t be empty.') }

    // if (_.isEmpty(data.dob)){ throw new AppError(400, `Empty field 'Date of Birth'`)}

    let valid = ajv.validate(signupSchema, data);
    if (!valid) {throw new AppError(400, ajv.errorsText(), ajv.errors.toString())}

    if (config.minAllowedAge && data.dob) {
        // validate age of user before signup

        const now = moment(new Date());
        const end = moment(data.dob);
        const duration = moment.duration(now.diff(end));
        const years = duration.asYears();

        if (years < config.minAllowedAge) {throw new AppError(403, `You should be older than ${config.minAllowedAge}.`)}
    }

    let user = await models.User.findOne({where: {email: data.email}, paranoid: false});

    let created:any = {};

    if (user) {
        if (user.deletedAt != null) {
            await user.restore();
            created = user;
        } else {
            throw new AppError(400, `User with email ${data.email} already exists.`)
        }
    } else {
        created = await models.User.create(data);
    }

    if (!created.emailVerified) { await NotificationService.sendConfirmationEmail(created) }

    return createTokens(user);
};

/**
 * Process confirmation of user email
 * @param confirmToken
 */
const signupConfirmation = async function (confirmToken) {

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

    logger.info(`User confirmed him email : ${token.user.email}`);

    return true
};

export default {
    comparePasswords,
    hashPassword,
    signToken,
    verifyToken,
    signin,
    socialSignin,
    signup,
    signupConfirmation
};