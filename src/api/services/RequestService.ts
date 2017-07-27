'use strict';

import config from '../../config/app';
import logger from '../../config/logger';
import * as request from 'request';
import * as _ from 'lodash';
import * as isJSON from 'is-json';
import * as Bluebird from "bluebird";
import AppError from "./AppError";

const send = function(url, method = 'GET', header = {}, body = {}) {

    return new Bluebird(function (resolve, reject) {
        delete  header["content-length"];

        const bodyJSON = _.isString(body) ? body : JSON.stringify(body);

        const options = {method, url, body: bodyJSON, header, form: _.get(body, 'form', {})};

        logger.verbose(`Sending request with options : \n ${JSON.stringify(options)}`);

        request(options, function(error, httpResponse, rawResponse) {

            let logMethod = logger.verbose;

            let response:any;

            if(isJSON(rawResponse)) {
                try {
                    response = JSON.parse(rawResponse);
                } catch (e) {
                    return reject(e);
                }
            } else {
                response = rawResponse;
            }

            if (error || httpResponse.statusCode >= 400) {
                logMethod = logger.error;
                reject(response);
            } else {
                resolve(response);
            }

            // logMethod(`HttpResponce: ${JSON.stringify(httpResponse)}`);
            logMethod(`Response: ${rawResponse}`);

        });
    });
};

export default {send}