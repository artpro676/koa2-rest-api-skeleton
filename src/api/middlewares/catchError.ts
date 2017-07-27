'use strict';

import AppError from '../services/AppError';
import EmailService from '../services/email/EmailService';
import logger from '../../config/logger';
import * as _ from 'lodash';
import config from '../../config/app';

const catchError = async function (ctx, next) {
    try {
        await next();
    } catch (err) {
        //console.info('catch', err);
        /** Handle Sequelize validation  errors */
        if (err.name && err.name === 'SequelizeUniqueConstraintError' && err.errors) {

            let errorMessage = '';
            _.each(err.errors, (e) => {
                errorMessage += e.message;
            });

            logger.warn('[SequelizeUniqueConstraintError]', 400, errorMessage, err.errors);

            ctx.status = 400;
            ctx.body = {
                error: {
                    message: errorMessage
                }
            };
            return;
        }

        if (err.httpStatus && err.httpStatus >= 400 && err.httpStatus < 500) {

            logger.warn('[AppError]', err.httpStatus, err.message);

            ctx.status = err.httpStatus;
            ctx.body = {
                error: {
                    message: err.message,
                }
            };
        } else {
            /** Unhandled errors and exceptions */
            logger.error(err);
            ctx.status = 500;
            ctx.body = {
                error: {
                    message: 'Server error',
                    developerMessage: err.message
                }
            };

            if (config.email.developerEmails) {
                try {
                    //console.log(JSON.stringify(err));
                    EmailService.sendTemplate('alert', config.email.developerEmails, {
                        title: _.isObject(err.message) ? JSON.stringify(err.message) : err.message ,
                        message: `Method: ${ctx.request.method} 
                        <br/> Route: ${ctx.request.url} 
                        <br/> Headers: ${JSON.stringify(ctx.request.header)}
                        <br/> Body: ${JSON.stringify(ctx.request.body)}
                        <br/> Stack: ${_.isObject(err.stack) ? JSON.stringify(err.stack) : err.stack}
                        `
                    });
                } catch (e) {
                    logger.error(e);
                }
            }
        }

        if (process.env.STAGE === 'master') delete ctx.body.error.developerMessage;
    }
};

export default () => catchError;