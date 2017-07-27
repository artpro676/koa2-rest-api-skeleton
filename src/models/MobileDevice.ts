'use strict';

import logger from '../config/logger';
import SNSService from '../api/services/SNSService';
import models from "./index";
import * as _ from "lodash";
import * as Bluebird from "bluebird";

export default function (sequelize, DataTypes) {

    const platforms = {
        IOS: 'ios',
        ANDROID: 'android',
    };

    const fields = {
        userId: {
            type: DataTypes.INTEGER
        },
        platform: {
            type: DataTypes.STRING,
            allowNull: false
        },
        uuid: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        token: {
            type: DataTypes.STRING
        },
        endpointArn: {
            type: DataTypes.STRING
        }
    };

    const schema = {
        type: 'object',
        properties: {
            userId: {type: 'integer'},
            platform: {enum: _.chain(platforms).values().value()},
            uuid: {type: 'string'},
            token: {type: 'string'},
            endpointArn: {type: 'string'}
        },
        additionalProperties: false,
        // required: ['platform', 'uuid']
    };

    const options = {
        timestamps: true,
        freezeTableName: true,
        classMethods: {
            schema,
            platforms,
            associate(models) {
                // relation to User
                models.MobileDevice.belongsTo(models.User, {
                    as: 'user',
                    foreignKey: "userId"
                });
                models.User.hasMany(models.MobileDevice, {as: 'mobileDevices'});
            },
        }
    };

    return sequelize.define('mobile_device', fields, options)
}