'use strict';

import config from '../../../config/app';
import logger from '../../../config/logger';
import models from '../../../models';
import AppError from '../../services/AppError';
import * as Ajv from 'ajv';
import * as _ from 'lodash';
import RequestService from '../../services/RequestService';

const types = models.EmailBlacklist.types;

const processNotification = async function (ctx) {

    let message:any = {};

    try {
        message = JSON.parse(ctx.request.body.Message)
    } catch (e) {
        throw new AppError(400, 'Invalid JSON format in field "Message"');
    }

    let key = '';
    const type = _.toLower(message.notificationType);
    switch (type) {
        case types.BOUNCE :
            key = 'bounce.bouncedRecipients';
            break;
        case types.COMPLAINT :
            key = 'complaint.ComplainedRecipients';
            break;
        default:
            logger.info(message);
            return;
    }

    const emails = _.map(_.get(message, key, []), function (item) {
        return {
            email: _.get(item, 'emailAddress', ''),
            reasonType: type
        };
    });

    let result:any;
    try {
        result = await models.EmailBlacklist.bulkCreate(emails);
    } catch (e) {
        throw new AppError(500, 'SequelizeError : ' + e.message);
    }

    return result;
};

const handleIncomingSNS = async function (ctx) {

    logger.verbose(ctx.request.header);
    logger.verbose(ctx.request.body);

    const type = ctx.request.body.Type;
    let result:any;

    switch (type) {
        case 'Notification' :
            result = await processNotification(ctx);
            break;
        case 'SubscriptionConfirmation' :
            const subscribeURL = ctx.request.body.SubscribeURL;

            try {
                result = await RequestService.GET(subscribeURL);
            } catch (e) {
                throw new AppError(500, e)
            }

            ctx.body = {data: {result}};
            break;
        default:
            result = {message: 'No data'}
    }

    ctx.body = {data: {result}};
};

export default {
    handleIncomingSNS
};