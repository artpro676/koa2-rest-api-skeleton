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
    'alert': {
        file: 'alert',
        subject: `${config.name} ${stage} Alert`
    },
    'signup_confirmation': {
        file: 'confirmation',
        subject: `${config.name} ${stage} Confirm signup`,
        data: {
            title: 'Hi,',
            message: 'Please confirm activation of your account',
            secondMessage: 'If you did not signup, please ignore this email.',
            buttonText: 'Confirm account',
            buttonAfter: ''
        }
    },
    'reset': {
        file: 'confirmation',
        subject: `${config.name} ${stage} Password reset`,
        data: {
            title: 'Hi,',
            message: 'A request has been made to reset the password for the BEAM Authentic account with this email address.',
            secondMessage: 'If you did not request this, you can ignore this message.',
            buttonText: 'Click here',
            buttonAfter: 'to reset your password.',
        }

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

    const message:any = await renderTemplate(meta.file, _.defaults(data, _.get(meta, 'data', {})));

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