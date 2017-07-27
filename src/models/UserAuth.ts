'use strict';

import logger from '../config/logger';
import models from './index';
import * as Bluebird from "bluebird";
import * as _ from 'lodash';

export default function (sequelize, DataTypes) {

    const providers = {
        FACEBOOK: 'facebook',
        TWITTER: 'twitter',
        INSTAGRAM: 'instagram',
        CROWDRISE: 'crowdrise'
    };

    /**
     * List of fields.
     *
     * @type {{title: {type: any}, url: {type: any}, tags: {type: any}}}
     */
    const fields = {
        userId: {
            type: DataTypes.INTEGER,
        },
        authId: {
            type: DataTypes.STRING,
        },
        authType: {
            type: DataTypes.STRING,
        },
        provider: {
            type: DataTypes.STRING,
        },
    };

    const instanceMethods = {};

    const relations = {
        tokens: {
            model: 'Token',
            on: sequelize.literal('"tokens"."userAuthId" = "user_auth"."id" AND ("tokens"."expiresAt" > NOW() OR "tokens"."expiresAt" IS NULL)')
        },
        user: {model: 'User'}
    };

    /**
     * Validation schema.
     * @type {{type: string, properties: {title: {type: string}, url: {type: string}, tags: {type: string, items: {type: string}}}, additionalProperties: boolean, required: string[]}}
     */
    const schema = {
        type: 'object',
        properties: {
            userId: {type: 'integer'},
            authId: {type: 'string'},
            authType: {type: 'string'},
            token: {type: ['string','object']},
            provider: {enum: _.values(providers)}
        },
        additionalProperties: false,
        required: ['authId','provider']
    };


    const hooks = {
        afterCreate: async function (instance, options) {
            logger.info('afterCreate');

            return new Bluebird((resolve, reject) => {
                resolve(instance)
            });
        },
    };


    const scopes = {
        byUserId: (userId) => {
            return {where: {userId}}
        },
        byProvider: (provider) => {
            return {where: {provider}}
        },
    };

    /**
     * Options
     * @type {{instanceMethods: {}, hooks: {afterCreate: (function(any, any): Promise<any>)}, timestamps: boolean, freezeTableName: boolean, classMethods: {relations: {}, schema: {type: string, properties: {title: {type: string}, url: {type: string}, tags: {type: string, items: {type: string}}}, additionalProperties: boolean, required: string[]}}}}
     */
    const options = {
        instanceMethods,
        scopes,
        timestamps: true,
        freezeTableName: true,
        classMethods: {
            relations,
            schema,
            providers,
            associate(models) {

                // relation to User
                models.UserAuth.belongsTo(models.User, {as: 'user'});
                models.User.hasMany(models.UserAuth, {as: 'auth'});

                // relation to UserAuth
                models.Token.belongsTo(models.UserAuth, {as: 'auth', foreignKey: 'userAuthId'});
                models.UserAuth.hasMany(models.Token, {as: 'tokens'});
            },
        }
    };

    return sequelize.define('user_auth', fields, options)
}
