'use strict';

import * as _ from 'lodash';
import models from '../../models';
import logger from '../../config/logger';
import SNSService from "./aws/SNSService";
import AppError from "./AppError";
import * as Ajv from 'ajv';

const ajv = Ajv({allErrors: true});

const assignToUser = async function (deviceData, userId) {

    deviceData.userId = userId;

    let valid = ajv.validate(models.MobileDevice.schema, deviceData);
    if (!valid) {throw new AppError(400, ajv.errorsText(), ajv.errors.toString())}

    let devices = await models.MobileDevice.findOrCreate({
        where: {uuid: deviceData.uuid, platform: deviceData.platform},
        defaults: deviceData
    });

    if (devices[0].token != deviceData.token || !devices[0].endpointArn) {

        devices[0].token = deviceData.token;
        devices[0].endpointArn = await SNSService.addDevice(devices[0]);
        await devices[0].save();
    }

    logger.info(`Mobile device with UUID ${devices[0].uuid} assigned successful`);

    return devices[0];
};


const unAssignToUser = async function (data, userId) {

    const result = await models.MobileDevice.destroy({
        where: {
            userId,
            uuid: data.uuid,
            platform: data.platform
        }
    });

    logger.info(`Mobile device (${data.platform}) with UUID ${data.uuid} unassigned successful`);

    return result;
};

export default {
    assignToUser,
    unAssignToUser
};