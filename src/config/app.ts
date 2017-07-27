'use strict';

import 'ms';
import logger from './logger';
import * as _ from 'lodash';

const config = {
    name: process.env.APP_NAME || 'ProjectName',
    stage: process.env.STAGE || 'development',
    port: process.env.PORT || 3001,
    db: {
        url: process.env.DATABASE_URL,
        options: {
            dialect: 'postgres',
            ssl: true,
            supportBigNumbers: true,
            dialectOptions: {
                ssl: {
                    require: true
                }
            },
            native: false,
            pool: {
                max: 5,
                min: 1,
                idle: 100000
            },
            logging: logger.silly
        }
    },
    frontendHost: process.env.FRONTEND_HOST,
    minAllowedAge: 13,
    saltFactor: 10,
    pageLimit: 10,
    jwt: {
        secret: process.env.JWT_SECRET || "h9fr3hf93r9uhn3-f9r7fgh-97gdfsd",
        expiresIn: process.env.JWT_EXPIRES_IN || 3600,
        issuer: 'Beam'
    },
    token: {
        resetPassword: {
            expiresIn: process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN || 60 * 60 * 24 // 1 day
        },
        confirmSignup: {
            expiresIn: process.env.CONFIRMATION_TOKEN_EXPIRES_IN || 60 * 60 * 24 * 7 // 7 day
        },
        disableNotification: {
            expiresIn: process.env.NOTIFICATION_DISABLE_TOKEN_EXPIRES_IN || 60 * 60 * 24 * 7 // 7 day
        },
        refreshToken: {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || 60 * 60 * 24 * 7 // 1 week
        },
    },
    aws: {
        accessKeyId: process.env.AWS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        region: process.env.AWS_REGION || "us-east-1"
    },
    s3: {
        bucket :  process.env.S3_BUCKET || 'default-bucket-name',
        urlExpiresIn: process.env.S3_URL_EXPIRES_IN || 600,
        folders: {
            user : process.env.S3_FOLDER_USER || 'users', // folder definitions
        }
    },
    sns: {
        live: _.includes(['development', 'qa', 'master', 'production'], process.env.STAGE),
        // live: true,
        platformArn : {
            android: process.env.SNS_PLATFORM_ARN_ANDROID,
            ios: process.env.SNS_PLATFORM_ARN_IOS
        },
        allUsersTopicName: 'all-users-subscribed-here' || process.env.SNS_ALL_USER_TOPIC_NAME,
        allUsersTopicARN:  process.env.SNS_ALL_USER_TOPIC_ARN ? process.env.SNS_ALL_USER_TOPIC_ARN : null
    },
    email :{
        live: _.includes(['development', 'qa', 'master', 'production'], process.env.STAGE),
        from: process.env.EMAIL_FROM || 'noreply@beamauthentic.com',
        supportEmails:  process.env.EMAILS_SUPPORT ? _.split(process.env.EMAILS_SUPPORT) : ['support@beamauthentic.com'],
        developerEmails:  process.env.EMAILS_DEVELOPER ? _.split(process.env.EMAILS_DEVELOPER) : ['Artur.Kononenko@pdt.com']
    },
    assets: {
        bannedBeamImageUrl: 'https://beam-asset-dev.s3.amazonaws.com/common/picture-banned'
    }
};

export default config;