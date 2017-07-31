'use strict';

import config from '../../../config/app';
import * as _ from 'lodash';
import AppError from '../AppError';
import AWS from './AWSService';
import * as Bluebird from "bluebird";

const s3 = new AWS.S3({
    signatureVersion: 'v4',
    // signatureCache: true
});

const ACLs = {
    PUBLIC: 'private',
    PUBLIC_READ: 'public-read',
    PUBLIC_READ_WRITE: 'public-read-write',
    AUTHENTICATED_READ: 'authenticated-read',
};

const createKey = (folder, userId, filename = "newfile") => {
    return `${folder}/${userId}/${filename}`
};

const convertUrlToObject = (url) => {
    const [link, signature] = _.split(url, '?');
    return {link, signature};
};


const createUploadUrl = function (folder, id, filename = "newfile") {
    const url = s3.getSignedUrl('putObject', {
        Bucket: config.s3.bucket,
        Key: createKey(folder, id, filename),
        Expires: config.s3.urlExpiresIn
    });

    return _.set(convertUrlToObject(url), 'name', filename);
};

const createDownloadUrl = function (folder, id, filename = "newfile") {
    if (/^http/.test(filename)) {return convertUrlToObject(filename + '?')}

    const url = s3.getSignedUrl('getObject', {
        Bucket: config.s3.bucket,
        Key: createKey(folder, id, filename),
        Expires: config.s3.urlExpiresIn
    });

    return convertUrlToObject(url)
};

const getHeadObject = async function (folder, id, filename = "newfile") {
    return new Bluebird(function (resolve, reject) {
        s3.headObject({Bucket: config.s3.bucket, Key: createKey(folder, id, filename)}, function (err, data) {
            if (err) { return reject(err) }
            resolve(data);
        });
    })
};


export default {
    createUploadUrl,
    createDownloadUrl,
    getHeadObject
};