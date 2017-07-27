'use strict';

import * as Bluebird from 'bluebird';
import config from '../../../config/app';
import aws from './AWSService';

const ses = new aws.SES({apiVersion: '2010-12-01'});

const sendEmail = function (options) {

    return new Bluebird(function (resolve, reject) {

        if(_.size(toEmails)== 0){ return reject("List of recepient emails is empty.") }

        if(!config.email.live) {
            logger.info('Skipped sending mails, because its not LIVE MODE');
            return resolve();
        }

        ses.sendEmail({
            Source: config.email.from,
            Destination: {ToAddresses: toEmails},
            Message: {
                Subject: {Data: options.subject},
                Body: {
                    Html: {Data: options.html},
                    Text: {Data: options.text}
                }
            }
        }, function (err, data) {
            if (err) { return reject(err) }
            logger.info(`${prefix} "${options.subject}" sent to user ${options.to} | ${data}`);
            resolve(data);
        })
    });
};

export default {
    sendEmail
};