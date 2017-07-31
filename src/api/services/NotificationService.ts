'use strict';

import * as _ from 'lodash';
import config from '../../config/app';
import logger from '../../config/logger';
import models from '../../models';
import SNSService from './aws/SNSService';
import TokenService from './auth/TokenService';
import EmailService from './email/EmailService';
import Utils from './Utils';
import AppError from "./AppError";

/**
 * Sending email for resetting user password
 * @param user
 */
const sendResetPasswordEmail = async function (user) {
    const resetPasswordToken = await TokenService.createResetPasswordToken(user);
    await EmailService.sendTemplate('reset', [user.email], {
        title: `Hi, ${user.fullname || 'user'}`,
        link: Utils.getResetLink(resetPasswordToken)
    });
};

/**
 * Sending email for confirmation user email
 * @param created
 */
const sendConfirmationEmail = async function (user) {
    const confirmToken = await TokenService.createConfirmationToken(user);
    await EmailService.sendTemplate('confirmation', [user.email], {
        title: `Hi, ${user.fullname || 'user'}`,
        link: Utils.getConfirmLink(confirmToken)
    });
};

/**
 * Wrapper for method send push notification to user devices.
 * @param message
 * @param users
 */
const sendPushNotifications = async function (message, users) {

    if(_.isEmpty(users) || (_.size(users) == 0)){
        throw new AppError(500, 'Array of recepients should not be empty')
    }

   return sendPushNotificationsToUsers(message, users)
};

const sendPushNotificationsToUsers = async function (message, users) {

    if(!config.sns.live){
        logger.warn(`Push notification is not sent, because its NOT LIVE mode.`);
        return 0
    }

    const query = {where: {$not: {$or: [{endpointArn: null}, {endpointArn: ''}]}}};

    if (!!users) { _.set(query.where, 'userId', {$in: users})}

    // TODO implement iterator with selecting portion of records

    const devices = await models.MobileDevice.findAll(query);

    try {
        const result = await SNSService.send(message, devices);
    } catch (e) {
        logger.error(e);
    }

    return _.size(devices)
};

const sendPushNotificationsToAll = async function (message) {

    if(!config.sns.live){
        logger.warn(`Push notification is not sent, because its NOT LIVE mode.`);
        return;
    }

    let result;
    try {
        result = await SNSService.publishToTopic(message, config.sns.allUsersTopicARN);
    } catch (e) {
        logger.error(e);
    }

    return result;
};

export default {
    sendConfirmationEmail,
    sendResetPasswordEmail,
    sendPushNotifications,
    sendPushNotificationsToUsers,
    sendPushNotificationsToAll
};
