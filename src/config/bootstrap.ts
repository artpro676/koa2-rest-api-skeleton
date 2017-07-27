'use strict';

import sequelize from './connection';
import config from './app';
import logger from './logger';
import SNSService from '../api/services/SNSService';

const bootstrap = async function () {
	logger.info('bootstrapping...');

	try {
		await sequelize.authenticate();
	} catch (err) {
		logger.error('unable to connect to the database: ', err);
	}

	logger.info(`connected to database ${config.db.url}`);

	/*TODO: check if all environment variables are set */

    if(config.sns.live) {
        logger.info('SNS is LIVE mode');
        try {
            config.sns.allUsersTopicARN = await SNSService.createTopicIfNotExists(config.sns.allUsersTopicName);
        } catch (e) {
            logger.error(e);
        }
    } else {
        logger.info('SNS is NOT LIVE mode');
    }
};

export default bootstrap;