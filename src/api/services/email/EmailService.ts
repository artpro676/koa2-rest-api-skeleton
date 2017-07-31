'use strict';

import * as _ from 'lodash';
import * as Bluebird from 'bluebird';
import * as path from 'path';
import {EmailTemplate} from 'email-templates';
import config from '../../../config/app';
import models from '../../../models';
import logger from '../../../config/logger';
import SESService from '../aws/SESService';
import AppError from "../AppError";

const templatesDir = path.join(__dirname, 'templates');
const stage = getAppStageForDisplay();


const templatesMeta = {
    'reset': {
        file: 'reset',
        subject: `${config.name} ${stage} Password reset`
    },
    'alert': {
        file: 'alert',
        subject: `${config.name} ${stage} Alert`
    },
    'user_block': {
        file: 'alert',
        subject: `${config.name} ${stage} Blocked user`
    },
    'beam_block': {
        file: 'alert',
        subject: `${config.name} ${stage} Blocked beam`
    },
    'post_block': {
        file: 'alert',
        subject: `${config.name} ${stage} Blocked post`
    },
    'confirmation': {
        file: 'confirmation',
        subject: `${config.name} ${stage} Confirm signup`
    },
    'follow_request': {
        file: 'follow_request',
        subject: `${config.name} ${stage} Following request`
    },
    'followed': {
        file: 'followed',
        subject: `${config.name} ${stage} You have new followers`
    },
    'followed_beam': {
        file: 'followed_beam',
        subject: `${config.name} ${stage} You have new beam followers`
    },
    'feedback': {
        file: 'feedback',
        subject: `${config.name} ${stage} Feedback from user`
    },
    'notification_disable': {
        file: 'notification_disable',
        subject: `${config.name} ${stage} Disable notifications`
    },
    'partner_request': {
        file: 'partner_request',
        subject: `${config.name} ${stage} Partner request`
    },
    'publisher_request_result': {
        file: 'publisher_request_result',
        subject: `${config.name} ${stage} Partner request is processed`
    },
    'subscription_request': {
        file: 'subscription_request',
        subject: `${config.name} ${stage} Subscription request`
    },
};

function getAppStageForDisplay() {
    switch (config.stage) {
        case 'master':
            return '';
        default:
            return `[${config.stage}]`;
    }
}

function getMeta(name) {
    let meta = templatesMeta[name];
    if (_.isUndefined(meta))
        throw new AppError(500, `Email template "${name}" is not defined!`);
    else
        return meta;
}

const filterEmails = async function (emails) {

    const blacklist = await models.EmailBlackList.findAll({where: {email: {$in : emails}}});

    if(_.size(blacklist) == 0) { return emails }

    const blacklistEmail = _.map(blacklist, 'email');

    logger.warn('Avoid to send messages to emails which are in blacklist : ' + _.join(blacklistEmail,', '));

    return _.difference(emails, blacklistEmail);
};

/**
 * Send email via AWS SES.
 * @param options
 */
const send = async function (options:any) {

    if(!_.isEmpty(options.to)) {
        options.to = await filterEmails(options.to);
    }

    return SESService.sendEmail(options)
};


/**
 * Send email with predefined template
 * @param templateName
 * @param to
 * @param data
 */
const sendTemplate = async function (templateName, to, data) {

    let meta = getMeta(templateName);

    const message:any = await renderTemplate(meta.file, data);

    let result:any={};
    try {
        result = await send({
            to: to,
            subject: meta.subject,
            text: message.text,
            html: message.html
        });
    } catch (e) {
        logger.error(e);
    }

    return result;
};

/**
 * Send email with predefined template
 * @param templateDir
 * @param data
 */
const renderTemplate = async function (templateDir, data) {

    const mail = new EmailTemplate(templatesDir + '/' + templateDir);

    data.appName = data.appName || config.name;
    data.stage = data.stage || stage;
    data.frontendHost = config.frontendHost;

    return new Bluebird((resolve, reject) => {
        mail.render(data, function (err, result) {
            if (err) { return reject(err) }

            resolve(result)
        });
    });

};

export default {
    send,
    sendTemplate
};