'use strict';

import logger from '../config/logger';
import config from '../config/app';
import AppError from '../api/services/AppError';
import AuthService from '../api/services/AuthService';
import {roles} from '../api/services/auth/PermissionService';
import PermissionService from '../api/services/auth/PermissionService';
import S3Service from '../api/services/S3Service';
import * as _ from 'lodash';
import * as slug from 'slug';
import * as Bluebird from "bluebird";

/**
 * Available statuses.
 *
 * @type {{ENABLED: string; DISABLED: string}}
 */
export const statuses = {
    NEW: 'new',
    ENABLED: 'enabled',
    DISABLED: 'disabled'
};

export const genders = {
    OTHER: 'other',
    MALE: 'male',
    FEMALE: 'female'
};

export default function (sequelize, DataTypes) {

    /**
     * Defined fields.
     */
    const fields = {
        username: {
            type: DataTypes.STRING
        },
        firstName: {
            type: DataTypes.STRING
        },
        lastName: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING,
            // allowNull: false,
            private: true
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: roles.USER,
            enum: _.values(roles),
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: statuses.NEW,
            enum: _.values(statuses)
        },
        bio: {
            type: DataTypes.STRING
        },
        gender: {
            type: DataTypes.STRING
        },
        dob: {
            type: DataTypes.DATE
        },
        enableEmailNotification: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        imageFileName: {
            type: DataTypes.STRING,
        }
    };

    /**
     * Virtual getters methods.
     *
     * @type {{asset: (()=>string)}}
     */
    const getterMethods = {
        asset: function () {

            if (!this.imageFileName) { return {} }

            return S3Service.createDownloadUrl(config.s3.folders.user, this.id, this.imageFileName)
        },
        fullname: function () {
            return _.trim((this.firstName || this.lastName) || (this.username || this.email))
        }
    };

    const setterMethods = {};

    /**
     * List of ORM hooks.
     */
    const hooks = {
        beforeCreate: async function (instance, options) {
            logger.info('beforeCreate');

            if (!instance.username) {
                const username = instance.email.split('@');
                instance.username = username[0];
            }

            /** replace plain password with hash */
            instance.password = await AuthService.hashPassword(instance.password);

            return new Bluebird(function (resolve, reject) {
                resolve(instance)
            })
        },
        beforeUpdate: async function (instance, options) {
            logger.info('beforeUpdate');

            if (options.fields.includes('password')) {instance.password = await AuthService.hashPassword(instance.password)}

            return new Bluebird(function (resolve, reject) {
                resolve(instance)
            })
        },
        beforeSave: async function (instance:any, options) {
            logger.info('beforeSave');

            if (options.fields.includes('password')) {instance.password = await AuthService.hashPassword(instance.password)}

            return new Bluebird(function (resolve, reject) {
                resolve(instance)
            })
        },
    };

    /**
     * Relations for queryFilterService.
     *
     * @type {{beams: {model: string}; beamDevices: {model: string}}}
     */
    const relations = {
        mobileDevices: {model: 'MobileDevice'},
    };

    const extraFields = (alias = 'user') => {
        return {
            onlineMobileDeviceCount: sequelize.literal(`(SELECT COUNT("d"."userId")::INT FROM "mobile_device" as "d" WHERE "d"."userId" = "${alias}"."id" AND ("d"."endpointArn" IS NOT NULL OR "d"."endpointArn" != ''))`),
        }
    };

    /**
     * Validation schema.
     */
    const schema = {
        type: 'object',
        properties: {
            username: {type: 'string'},
            firstName: {type: 'string'},
            lastName: {type: 'string'},
            email: {type: 'string', format: 'email'},
            password: {
                type: ['string', 'integer'],
                minLength: 4
            },
            role: {enum: _.chain(roles).values().push("").value()},
            status: {enum: _.chain(statuses).values().push("").value()},
            imageFileName: {type: 'string'},
            bio: {type: 'string'},
            dob: {type: 'string'},
            enableEmailNotification: {type: 'boolean'},
            gender: {enum: _.chain(genders).values().push("").value()},
        },
        additionalProperties: false,
        required: ['email', 'password']
    };

    const scopes = {
        public: (user) => {
            return {
                where: {
                    status: {$not: statuses.DISABLED},
                    role: {$not: roles.ADMIN}
                }
            }
        }
    };

    /**
     * Instance methods.
     *
     * @type {{toJSON: (()=>any); isActive: (()=>boolean); createUploadUrl: (()=>any)}}
     */
    const instanceMethods = {
        toJSON: function () {
            let object = this.get();
            delete object.password;
            return object;
        },
        isDisabled: function () {
            return this.status === statuses.DISABLED
        },
        createUploadUrl: function (name) {
            if (!name) { name = slug(`profile-image-${(new Date()).toISOString()}`)}
            return S3Service.createUploadUrl(config.s3.folders.user, this.id, name);
        },
        isAdmin: function () {
            return PermissionService.roleIsAdmin(this.role);
        }
    };

    /**
     * Static methods.
     */
    const classMethods = {
        extraFields,
        schema,
        relations,
        statuses,
        roles,
        types,
        genders,
        followRestrictions,
        associate(models) {
            models.User.belongsTo(models.User, {as: 'streamer', foreignKey: "streamerId"});
        }
    };

    /**
     * Grouped options for sequenize.
     */
    const options = {
        indexes,
        hooks,
        scopes,
        getterMethods,
        setterMethods,
        timestamps: true,
        paranoid: true,
        freezeTableName: true,
    };

    return _.merge(sequelize.define(TABLE_NAME, fields, options), classMethods, {instanceMethods})
}

