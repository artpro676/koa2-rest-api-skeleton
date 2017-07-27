'use strict';

import config from '../../config/app';
import * as _ from 'lodash';
import AppError from '../AppError';
import AWS from './AWSService';
import * as Bluebird from "bluebird";
import logger from "../../config/logger";
import models from "../../models";

const sns = new AWS.SNS({apiVersion: '2010-03-31'});

/****** WRAPPERS ******/

function createTopic(topicName) {
    return new Bluebird(function (resolve, reject) {
        sns.createTopic({Name: topicName}, function (err, data) {
            if (err) {return reject(err)}

            resolve(data);
        });
    });
}

function getList() {
    return new Bluebird(function (resolve, reject) {
        sns.listTopics({}, function (err, data) {
            if (err) {return reject(err)}

            resolve(_.get(data, 'Topics', []));
        });
    });
}

function deleteTopic(topicArn) {
    return new Bluebird(function (resolve, reject) {
        sns.deleteTopic({TopicArn: topicArn}, function (err, data) {
            if (err) {return reject(err)}

            resolve(data);
        });
    });
}

function createPlatfornEndpoint(params) {
    return new Bluebird(function (resolve, reject) {

        sns.createPlatformEndpoint(params, function (err, data) {
            if (err) { return reject(err) }

            resolve(data.EndpointArn);
        })
    });
}

function subscribe(params) {
    return new Bluebird(function (resolve, reject) {

        sns.subscribe(params, function (err, data) {
            if (err) { return reject(err) }

            resolve(_.get(data, 'SubscriptionArn'));
        })
    });
}

function publish(params) {
    return new Bluebird(function (resolve, reject) {

        sns.publish(params, function (err, data) {
            if (err) { return reject(err) }

            resolve(data);
        })
    });
}

/******* METHODS **********/

/**
 * Send push to IOS devices
 * @param message
 * @param endpointArn
 * @returns {Bluebird}
 */
const sendToIOS = async function (message, endpointArn) {

    let payload:any = {
        default: message,
        APNS: {
            aps: {
                alert: message,
                sound: 'default',
                badge: 1
            }
        }
    };

    // first have to stringify the inner APNS object...
    payload.APNS = JSON.stringify(payload.APNS);

    // then have to stringify the entire message payload
    payload = JSON.stringify(payload);

    return new Bluebird(function (resolve, reject) {
        sns.publish({
            Message: payload,
            MessageStructure: 'json',
            TargetArn: endpointArn
        }, function (err, data) {
            if (err) {return reject(err)}

            resolve(data);
        });
    });
};

/**
 * Register devices on SNS
 * @param deviceInstance
 */
const addDevice = async function (deviceInstance) {

    const platforms = models.MobileDevice.platforms;
    let arn = '';

    if (deviceInstance.platform == platforms.IOS) {
        if (!config.sns.platformArn.ios) {
            logger.warn('Platform ARN endpoint IOS is not defined');
            return;
        }
        arn = config.sns.platformArn.ios;
    } else if (deviceInstance.platform == platforms.ANDROID) {
        if (!config.sns.platformArn.android) {
            logger.warn('Platform ARN endpoint ANDROID is not defined');
            return;
        }
        arn = config.sns.platformArn.android;
    }

    const endpointArn = await createPlatfornEndpoint({PlatformApplicationArn: arn, Token: deviceInstance.token});

    logger.verbose(`Created endpoint for mobile device ID:${deviceInstance.id}`);

    if (config.sns.allUsersTopicARN) {
        const subscribeArn = await subscribe({
            Protocol: 'application',
            TopicArn: config.sns.allUsersTopicARN,
            Endpoint: endpointArn
        });

        if (subscribeArn) {
            logger.verbose(`Subscribed endpoint of mobile device ID:${deviceInstance.id} 
            to topic ${config.sns.allUsersTopicName}`);
        }
    }

    return endpointArn
};


/**
 * @param message
 * @param deviceInstances
 * @returns {{}}
 */
const send = async function (message, deviceInstances) {

    const platforms = models.MobileDevice.platforms;

    let list = _.isArray(deviceInstances)
        ? deviceInstances
        : [deviceInstances];

    const result = {};
    const failedDeviceId = [];

    for (var i in deviceInstances) {

        const endpointArn = deviceInstances[i].endpointArn;

        if (!endpointArn) {
            logger.warn(`Mobile device ID=${deviceInstances[i].id} doesn't have endpointArn`);
            continue;
        }

        if (deviceInstances[i].platform == platforms.IOS) {
            try {
                const itemResult:any = await sendToIOS(message, endpointArn);
                result[deviceInstances[i].id] = itemResult;
                logger.silly(itemResult);
            } catch (e) {
                logger.error(e);
                failedDeviceId.push(deviceInstances[i].id);
            }
        }

        // TODO implement sending pushes to ANDROID
    }

    if (_.size(failedDeviceId) > 0) {
        await models.MobileDevice.update({endpointArn: null}, {where: {id: {$in: failedDeviceId}}});
    }

    return result;
};

/**
 * @param topicName
 * @returns {any}
 */
const createTopicIfNotExists = async function (topicName = '') {
    if (!topicName) { topicName = config.sns.allUsersTopicName }

    const topics = await getList();

    const topicData = _.find(topics, (topic:any) => {
        return topic.TopicArn.match(topicName)
    });

    if (topicData) {
        logger.info(`SNS Topic with name ${topicName} already exists.`);
        return topicData.TopicArn
    }

    const createdTopic = await createTopic(topicName);

    logger.info(`SNS Topic with name ${topicName} just created exists.`);

    return _.get(createdTopic, 'TopicArn');
};

const publishToTopic = async function(message, topicArn = ''){

    if(!topicArn) {topicArn = config.sns.allUsersTopicARN}

    var params = {
        Message: message,
        // MessageStructure: 'STRING_VALUE',
        // PhoneNumber: 'STRING_VALUE',
        // Subject: 'STRING_VALUE',
        TopicArn: topicArn
    };

    const result = await publish(params);

    return result
};

export default {
    send,
    addDevice,
    createTopicIfNotExists,
    publishToTopic
};