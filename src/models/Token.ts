'use strict';

import logger from '../config/logger';
import config from '../config/app';
import * as uuid from 'uuid';
import * as _ from 'lodash';
import models from "./index";
import * as Bluebird from "bluebird";

export default function (sequelize, DataTypes) {

    const authTypes = {
        OTHER: 'other',
        EMAIL: 'email',
        SOCIAL_TWITTER: 'sc_twitter',
        SOCIAL_FACEBOOK: 'sc_facebook'
    };

    const types = {
        REFRESH_TOKEN: 'refresh_token',
        RESET_PASSWORD_TOKEN: 'reset_password_token',
        SIGNUP_CONFIRMATION_TOKEN: 'confirmation_token',
        FACEBOOK_AUTH_TOKEN: 'facebook_auth_token',
        TWITTER_AUTH_TOKEN: 'twitter_auth_token',
        TWITTER_AUTH_SECRET_TOKEN: 'twitter_auth_secret_token',
        NOTIFICATION_DISABLE_TOKEN: 'notification_disable_token',
    };

    const fields = {
        userId: {
            type: DataTypes.INTEGER
        },
        userAuthId: {
            type: DataTypes.INTEGER
        },
        type: {
            type: DataTypes.STRING,
        },
        authType: {
            type: DataTypes.STRING,
            defaultValue: authTypes.OTHER
        },
        value: {
            type: DataTypes.STRING,
            primaryKey: true
            //defaultValue: uuid.v4()
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(Date.now() + (3600 * 1000)) // default: 1 hour
        }
    };

    const indexes = [
        {unique: true, fields: ['value', 'userId']}
    ];

    const instanceMethods = {};

    /**
     * List of hooks
     * @type {{beforeCreate: ((instance, options, next)=>Promise<any>)}}
     */
    const hooks = {
        beforeCreate: async function (instance, options) {
            logger.info('beforeCreate');

            instance.value = uuid.v4();

            return new Bluebird(function (resolve, reject) {
                resolve(instance)
            })
        },
    };

    const options = {
        indexes,
        instanceMethods,
        hooks,
        timestamps: true,
        freezeTableName: true,
        classMethods: {
            associate(models) {
                // relation to User
                models.Token.belongsTo(models.User, {as: 'user', foreignKey: "userId"});
                models.User.hasMany(models.Token, {as: 'tokens'});

                // relation to UserAuth
                models.Token.belongsTo(models.UserAuth, {as: 'auth', foreignKey: 'userAuthId'});
                models.UserAuth.hasMany(models.Token, {as: 'tokens'});
            },
            types,
            authTypes
        }
    };

    return sequelize.define('token', fields, options)
}