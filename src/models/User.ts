'use strict';

import logger from '../config/logger';
import config from '../config/app';
import AppError from '../api/services/AppError';
import MobileDeviceService from '../api/services/MobileDeviceService';
import AuthService from '../api/services/AuthService';
import StreamService from '../api/services/StreamService';
import {roles} from '../api/services/RoleService';
import RoleService from '../api/services/RoleService';
import S3Service from '../api/services/S3Service';
import EventService from '../api/services/EventService';
import EmailService from '../api/services/EmailService';
import UserService from '../api/services/UserService';
import models from './index';
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
    ORG: 'org',
    MALE: 'male',
    FEMALE: 'female'
};

export const types = {
    NORMAL: 'normal',
    TRUSTED: 'trusted'
};


export default function (sequelize, DataTypes) {

    const followRestrictions = {
        ANYBODY: 'anybody',
        ASK_ME: 'ask_me',
        NOBODY: 'nobody',
    };

    /**
     * Defined fields.
     */
    const fields = {
        username: {
            type: DataTypes.STRING
        },
        companyName: {
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
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: types.NORMAL,
            enum: _.values(types),
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: statuses.NEW,
            enum: _.values(statuses)
        },
        description: {
            type: DataTypes.STRING
        },
        isPrivate: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        canBeFollowed: {
            type: DataTypes.STRING,
            defaultValue: followRestrictions.ANYBODY,
            enum: _.values(followRestrictions)
        },
        gender: {
            type: DataTypes.STRING
        },
        dob: {
            type: DataTypes.DATE
        },
        enableNotification: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        pictureName: {
            type: DataTypes.STRING,
        },
        categoryId: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
        },
        interestId: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
        },
        appealId: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
        },
        lastEventId: {
            type: DataTypes.BIGINT,
        },
        lastBeamId: {
            type: DataTypes.INTEGER,
        },
        streamerId: {
            type: DataTypes.INTEGER,
        },
        streamUpdatedAt: {
            type: DataTypes.DATE,
        },
        authId: {
            type: DataTypes.STRING,
        },
        deleteDescription: {
            type: DataTypes.STRING,
        },
        isPermanentFollowing: {
            type: DataTypes.BOOLEAN,
        }
    };

    /**
     * Virtual getters methods.
     *
     * @type {{asset: (()=>string)}}
     */
    const getterMethods = {
        asset: function () {

            if (!this.pictureName) { return {} }

            return S3Service.createDownloadUrl(S3Service.types.USER, this.id, this.pictureName)
        },
        fullname: function () {
            return _.trim(((this.firstName || this.lastName) ?
                _.toString(this.firstName) + ' ' + _.toString(this.lastName) : false) ||
                (this.username) || (this.companyName) || (this.email))
        }
    };

    const setterMethods = {};

    /**
     * Indexes.
     *
     * @type {{unique: boolean; fields: string[]}[]}
     */
    const indexes = [
        {unique: true, fields: ['email']},
    ];

    /**
     * List of ORM hooks.
     */
    const hooks = {
        beforeBulkCreate: function (instances, options) {
            logger.info('beforeBulkCreate');

            return new Bluebird(function (resolve, reject) {
                resolve(instances)
            })
        },
        beforeBulkDestroy(options, next) {
            logger.info('beforeBulkDestroy');
            options.where.role = {$ne: 'super'};
            next();
        },
        beforeBulkUpdate(options, next) {
            logger.info('beforeBulkUpdate');
            next();
        },
        beforeValidate(instance, options, next) {
            logger.info('beforeValidate');
            next();
        },
        afterValidate(instance, options, next) {
            logger.info('afterValidate');
            next();
        },
        validationFailed(instance, options, error, next) {
            logger.info('validationFailed', error);
            next();
        },
        beforeCreate: async function (instance, options) {
            logger.info('beforeCreate');

            if (!instance.username) {
                const username = instance.email.split('@');
                instance.username = username[0];
            }

            if (!instance.canBeFollowed) {
                instance.canBeFollowed = followRestrictions.ANYBODY;
            }

            if (!instance.isPrivate) {
                instance.isPrivate = false
            }

            /** replace plain password with hash */
            instance.password = await AuthService.hashPassword(instance.password);

            const lastEvent = await EventService.getLastEvent();
            instance.lastEventId = lastEvent ? lastEvent.id : 0;

            return new Bluebird(function (resolve, reject) {
                resolve(instance)
            })
        },
        beforeDestroy: async function (instance, options) {
            logger.info('beforeDestroy');

            return new Bluebird(async function (resolve, reject) {
                if (instance.role == 'super') {
                    return reject("You can not to remove super admin");
                }

                await UserService.dropRelatedRecords(instance);

                resolve(instance)
            })
        },
        beforeUpdate: async function (instance, options) {

            logger.info('beforeUpdate');

            if (options.fields.includes('password')) {instance.password = await AuthService.hashPassword(instance.password)}

            if (options.fields.includes('streamerId') && !!instance.streamerId && instance.streamerId > 0) {
                instance.streamUpdatedAt = new Date(Date.now());
                await EventService.create.streamBeamUser(instance);
            }

            return new Bluebird(function (resolve, reject) {
                resolve(instance)
            })
        },
        beforeSave: async function (instance:any, options) {
            logger.info('beforeSave');

            if (options.fields.includes('password')) {instance.password = await AuthService.hashPassword(instance.password)}

            if (options.fields.includes('streamerId') && !!instance.streamerId && instance.streamerId > 0) {
                instance.streamUpdatedAt = new Date(Date.now());
                await EventService.create.streamBeamUser(instance);
            }

            return new Bluebird(function (resolve, reject) {
                resolve(instance)
            })
        },
        beforeUpsert(values, options, next) {
            logger.info('beforeUpsert', values);
            next();
        },
        afterCreate: async function (instance, options) {
            logger.info('afterCreate');

            await StreamService.createPrimaryStream(instance);

            try {
                await UserService.creatPermanentFollow(instance);
            } catch (e) {
                logger.error(e);
            }

            return new Bluebird(function (resolve, reject) {
                resolve(instance)
            })
        },
        afterDestroy(instance, options, next) {
            logger.info('afterDestroy');
            next();
        },
        afterUpdate: async function (instance, options) {
            logger.info('afterUpdate');

            return new Bluebird(function (resolve, reject) {
                resolve(instance)
            })
        },
        afterFind: async function (instance, options) {
            logger.info('afterFind');

            if(_.isArray(instance)){
                instance = _.map(instance, processInstance);
            } else {
                instance = processInstance(instance);
            }

            return new Bluebird(function (resolve, reject) {
                resolve(instance)
            });
            function processInstance(user) {
                if(user && user.id){
                    try {
                        user.id = _.toInteger(user.id)
                    } catch (e) {logger.error(e);}
                }
            }
        },
        afterSave(instance, options, next) {
            logger.info('afterSave');
            next();
        },
        afterUpsert(created, options, next) {
            logger.info('afterUpsert');
            next();
        },
        afterBulkCreate: async function (instances, options) {
            logger.info('afterBulkCreate');

            return new Bluebird(function (resolve, reject) {
                resolve(instances)
            })
        },
        afterBulkDestroy(options, next) {
            logger.info('afterBulkDestroy');
            next();
        },
        afterBulkUpdate: async function (options) {
            logger.info('afterBulkUpdate');

            return new Bluebird(function (resolve, reject) {
                resolve(options)
            })
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
            if (!name) { name = slug(`picture-${(new Date()).toISOString()}`)}
            return S3Service.createUploadUrl(S3Service.types.USER, this.id, name);
        },
        isAdmin: function () {
            return RoleService.roleIsAdmin(this.role);
        }
    };

    /**
     * Relations for queryFilterService.
     *
     * @type {{beams: {model: string}; beamDevices: {model: string}}}
     */
    const relations = {
        plans: {model: 'Plan'},
        streams: {model: 'Stream'},
        subscriptions: {model: 'Subscription'},
        beams: {model: 'Beam'},
        beamDevices: {model: 'BeamDevice'},
        mobileDevices: {model: 'MobileDevice'},
        followers: {model: 'Follow'},
        followings: {model: 'Follow'},
        categories: {model: 'Category', on: sequelize.literal('"categories"."id" = ANY("user"."categoryId")')},
        interests: {model: 'Interest', on: sequelize.literal('"interests"."id" = ANY("user"."interestId")')},
        // auth: {model: 'UserAuth'}, // #TODO should be hidden for other users
        // categories: {model: 'Category', on: sequelize.literal('"categories"."id" = ANY("user"."categoryId")')}
        appeals: {model: 'Appeal', on: sequelize.literal('"appeals"."id" = ANY("user"."appealId")')},
        streamer: {model: 'User'},
    };

    const extraFields = (alias = 'user') => {
        return {
            followersCount: [sequelize.literal(`(SELECT COUNT("f"."followerId")::INT FROM "follow" as "f" WHERE "f"."followingId" = "${alias}"."id")`), 'followersCount'],
            followingsCount: [sequelize.literal(`(SELECT COUNT("f"."followingId")::INT FROM "follow" as "f" WHERE "f"."followerId" = "${alias}"."id")`), 'followingsCount'],
            createdBeamsCount: [sequelize.literal(`(SELECT COUNT("b"."id")::INT FROM "beam" as "b" WHERE "b"."userId" = "${alias}"."id")`), 'createdBeamsCount'],
            savedBeamCount: [sequelize.literal(`(SELECT COUNT("sb"."beamId")::INT FROM "saved_content" as "sb" WHERE "sb"."userId" = "${alias}"."id" AND "sb"."beamId" IS NOT NULL)`), 'savedBeamCount'],
            // TODO refactor allBeamsCount query
            allBeamsCount: [sequelize.literal(`((SELECT COUNT("b"."id")::INT FROM "beam" as "b" WHERE "b"."userId" = "${alias}"."id") + (SELECT COUNT("sb"."beamId")::INT FROM "saved_content" as "sb" WHERE "sb"."userId" = "${alias}"."id" AND "sb"."beamId" IS NOT NULL))`), 'allBeamsCount'],
            isFollowed: (ctx) => { // shows true or false
                return [sequelize.literal(`(SELECT (COUNT("f"."followerId") > 0) FROM "follow" as "f" 
                WHERE "f"."followingId" = "${alias}"."id" AND "f"."followerId" = ${_.get(ctx, 'state.account.id', 0)})`), 'isFollowed']
            },
            blockedUserCount: [sequelize.literal(`(SELECT COUNT("b"."userId")::INT FROM "user_black_list" as "b" WHERE "b"."userId" = "${alias}"."id")`), 'blockedUserCount'],
            blockedBeamCount: [sequelize.literal(`(SELECT COUNT("b"."beamId")::INT FROM "beam_black_list" as "b" WHERE "b"."userId" = "${alias}"."id")`), 'blockedBeamCount'],
            onlineMobileDeviceCount: [sequelize.literal(`(SELECT COUNT("d"."userId")::INT FROM "mobile_device" as "d" WHERE "d"."userId" = "${alias}"."id" AND ("d"."endpointArn" IS NOT NULL OR "d"."endpointArn" != ''))`), 'onlineMobileDeviceCount'],
        }
    };

    /**
     * Validation schema.
     *
     * @type {{type: string; properties: {firstName: {type: string}; lastName: {type: string}; email: {type: string; format: string}; password: {type: string|string[]; minLength: number}; role: {type: string}; status: {type: string}; picture: {type: string}; description: {type: string}; dob: {type: string}}; additionalProperties: boolean; required: string|string[]}}
     */
    const schema = {
        type: 'object',
        properties: {
            username: {type: 'string'},
            firstName: {type: 'string'},
            lastName: {type: 'string'},
            fullName: {type: 'string'},
            companyName: {type: 'string'},
            email: {type: 'string', format: 'email'},
            password: {
                type: ['string', 'integer'],
                minLength: 4
            },
            address: {type: 'string'},
            city: {type: 'string'},
            region: {type: 'string'},
            postalCode: {type: 'string'},
            country: {type: 'string'},
            role: {enum: _.chain(roles).values().push("").value()},
            type: {enum: _.chain(types).values().push("").value()},
            status: {enum: _.chain(statuses).values().push("").value()},
            authId: {type: 'string'},
            streamerId: {type: ['integer', 'null']},
            pictureName: {type: 'string'},
            description: {type: 'string'},
            dob: {type: 'string'},
            enableNotification: {type: 'boolean'},
            isPrivate: {type: 'boolean'},
            gender: {enum: _.chain(genders).values().push("").value()},
            imageUpdatedAt: {type: 'string'},
            categoryId: {
                type: 'array',
                items: {type: "integer"}
            },
            interestId: {
                type: 'array',
                items: {type: "integer"}
            },
            appealId: {
                type: 'array',
                items: {type: "integer"}
            },
            // deleteDescription: {type: 'string'}
        },
        additionalProperties: false,
        required: ['email', 'password']
    };

    const scopes = {
        public: (user) => {
            return {
                where: {
                    isPrivate: {$not: true},
                    status: {$not: statuses.DISABLED},
                    role: {$notIn: [roles.ADMIN, roles.SUPER_ADMIN]}
                }
            }
        },
        publicOnly: {
            where: {status: {$not: statuses.DISABLED, isPrivate: false}},
        },
        relatedBeam: (beam) => {
            return {
                where: {
                    $or: [
                        {id: {$in: sequelize.literal(`(SELECT "d"."userId" FROM "beam_device" as "d" WHERE ${beam.id} = ANY("d"."beamId") OR "d"."streamedBeamId" = ${beam.id})`)}},
                        {id: {$in: sequelize.literal(`(SELECT "s"."userId" FROM "saved_content" as "s" WHERE "s"."beamId" = ${beam.id})`)}},
                        {id: beam.userId},
                    ],
                }
            }
        },
        relatedPost: (post) => {
            return {
                where: {
                    $or: [
                        {id: {$in: sequelize.literal(`(SELECT "d"."userId" FROM "beam_device" as "d" WHERE ${post.id} = ANY("d"."postId") OR "d"."streamedPostId" = ${post.id})`)}},
                        {id: {$in: sequelize.literal(`(SELECT "s"."userId" FROM "saved_content" as "s" WHERE "s"."postId" = ${post.id})`)}},
                        {id: post.userId},
                    ],
                }
            }
        },
        follower: (userId) => {
            return {
                where: {
                    id: {$in: sequelize.literal(`(SELECT "f"."followingId" FROM "follow" as "f" WHERE "f"."followerId" = ${userId})`)}
                }
            }
        },
        following: (userId) => {
            return {
                where: {
                    id: {$in: sequelize.literal(`(SELECT "f"."followerId" FROM "follow" as "f" WHERE "f"."followingId" = ${userId})`)}
                }
            }
        },
        skipBlocked: (userId) => {
            return {
                where: {
                    id: {$notIn: sequelize.literal(`(SELECT "bl"."accusedUserId" FROM "user_black_list" as "bl" WHERE "bl"."userId" = ${userId})`)}
                }
            }
        },
        skipUser: (userId) => {
            return {
                where: {$not: {id: userId}}
            }
        },
        blocked: (userId) => {
            return {
                where: {
                    id: {$in: sequelize.literal(`(SELECT "bl"."accusedUserId" FROM "user_black_list" as "bl" WHERE "bl"."userId" = ${userId})`)}
                }
            }
        }
    };

    /**
     * Grouped options for sequenize.
     *
     * @type {{indexes: {unique: boolean; fields: string[]}[]; instanceMethods: {toJSON: (()=>any); isActive: (()=>boolean); createUploadUrl: (()=>(any|Promise<any>|string))}; hooks: {beforeBulkCreate: ((instances, options, next)=>any); beforeBulkDestroy: ((options, next)=>any); beforeBulkUpdate: ((options, next)=>any); beforeValidate: ((instance, options, next)=>any); afterValidate: ((instance, options, next)=>any); validationFailed: ((instance, options, error, next)=>any); beforeCreate: ((instance, options, next)=>Promise<any>); beforeDestroy: ((instance, options, next)=>any); beforeUpdate: ((instance, options, next)=>Promise<any>); beforeSave: ((instance, options, next)=>any); beforeUpsert: ((values, options, next)=>any); afterCreate: ((instance, options, next)=>any); afterDestroy: ((instance, options, next)=>any); afterUpdate: ((instance, options, next)=>any); afterSave: ((instance, options, next)=>any); afterUpsert: ((created, options, next)=>any); afterBulkCreate: ((instances, options, next)=>any); afterBulkDestroy: ((options, next)=>any); afterBulkUpdate: ((options, next)=>any)}; timestamps: boolean; freezeTableName: boolean; classMethods: {schema: {type: string; properties: {firstName: {type: string}; lastName: {type: string}; email: {type: string; format: string}; password: {type: string|string[]; minLength: number}; role: {type: string}; status: {type: string}; picture: {type: string}; description: {type: string}; dob: {type: string}}; additionalProperties: boolean; required: string|string[]}; relations: {beams: {model: string}; beamDevices: {model: string}}; statuses: {ENABLED: string; DISABLED: string}; roles: any}}}
     */
    const options = {
        indexes,
        instanceMethods,
        hooks,
        scopes,
        getterMethods,
        setterMethods,
        timestamps: true,
        paranoid: true,
        freezeTableName: true,
        classMethods: {
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
            },
        }
    };

    return sequelize.define('user', fields, options);
}

