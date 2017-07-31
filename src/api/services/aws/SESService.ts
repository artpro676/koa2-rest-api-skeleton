'use strict';

import * as Bluebird from 'bluebird';
import config from '../../../config/app';
import logger from '../../../config/logger';
import aws from './AWSService';
import * as _ from 'lodash';

const ses = new aws.SES({apiVersion: '2010-12-01'});

const sendEmail = function (options:any) {

    return new Bluebird(function (resolve, reject) {

        if(_.size(options.to)== 0){ return reject("List of recepient emails is empty.") }

        if(!config.email.live) {
            logger.info('Skipped sending mails, because its not LIVE MODE');
            return resolve();
        }

        ses.sendEmail({
            Source: config.email.from,
            Destination: {ToAddresses: options.to},
            Message: {
                Subject: {Data: options.subject},
                Body: {
                    Html: {Data: options.html},
                    Text: {Data: options.text}
                }
            }
        }, function (err, data) {
            if (err) { return reject(err) }
            logger.info(`Email with "${options.subject}" sent to user ${options.to} | ${data}`);
            resolve(data);
        })
    });
};

export default {
    sendEmail
};