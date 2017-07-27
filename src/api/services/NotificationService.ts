'use strict';

import * as _ from 'lodash';
import config from '../../config/app';
import logger from '../../config/logger';
import models from '../../models';
import SNSService from '../services/SNSService';
import TokenService from '../services/TokenService';
import EmailService from '../services/EmailService';
import Utils from '../services/Utils';
import AppError from "./AppError";

/**
 * Sending email notification to user
 * that someone followed this user
 * or made follow request
 * @param ctx
 * @param mailTemplate
 */
const sendEmailTemplateUserFollow = async function (ctx, mailTemplate) {
    const notificationDisableToken = await TokenService.createNotificationDisableToken(ctx.state.account);
    await EmailService.sendTemplate(mailTemplate, [ctx.state.account.email], {
        name: ctx.state.account.firstName || ctx.state.account.username,
        followerName: ctx.state.user.firstName || ctx.state.user.username,
        link: Utils.getNotificationDisableLink(notificationDisableToken)
    });
};

/**
 * Sending email notification to user
 * that someone followed this user beam
 * @param ctx
 * @param beamOwner
 */
const sendEmailTemplateBeamFollow = async function (ctx, beamOwner) {
    const notificationDisableToken = await TokenService.createNotificationDisableToken(beamOwner);
    await EmailService.sendTemplate('followed_beam', [beamOwner.email], {
        name: beamOwner.firstName || beamOwner.username,
        followerName: ctx.state.user.firstName || ctx.state.user.username,
        beamDescription: ctx.state.beam.title || ctx.state.beam.description,
        link: Utils.getNotificationDisableLink(notificationDisableToken)
    });
};

/**
 * Sending email for resetting user password
 * @param user
 */
const sendResetPasswordEmail = async function (user) {
    const resetPasswordToken = await TokenService.createResetPasswordToken(user);
    await EmailService.sendTemplate('reset', [user.email], {
        name: user.fullname || 'user',
        link: Utils.getResetLink(resetPasswordToken)
    });
};

/**
 * Sending email for confirmation user email
 * @param created
 */
const sendConfirmationEmail = async function (created) {
    const confirmToken = await TokenService.createConfirmationToken(created);
    await EmailService.sendTemplate('confirmation', [created.email], {
        name: created.fullname || 'user',
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
    sendEmailTemplateUserFollow,
    sendEmailTemplateBeamFollow,
    sendResetPasswordEmail,
    sendPushNotifications,
    sendPushNotificationsToUsers,
    sendPushNotificationsToAll
};
