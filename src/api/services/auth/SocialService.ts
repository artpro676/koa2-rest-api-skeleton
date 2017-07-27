'use strict';

import config from '../../config/app';
import models from '../../models';
import * as _ from 'lodash';
import * as Twitter from 'twitter';
import AppError from '../AppError';
import RequestService from './RequestService';
import * as Bluebird from "bluebird";

const getClientId = async function(user, provider, token, secretToken) {
    let response:any;

    if(!token){ throw new AppError(400, 'Access token is required')}

    switch (provider) {
        case 'facebook':
            response = await RequestService.GET(`https://graph.facebook.com/me?access_token=${token}`);
            return response.id;
        case 'twitter':
            if(!secretToken){ throw new AppError(400, 'Access secret token is required')}

            const  twitterClient = new Twitter({
                consumer_key: config.twitter.consumerKey,
                consumer_secret: config.twitter.consumerSecret,
                access_token_key: token,
                access_token_secret: secretToken
            });

            let res:any;
            try {
                res = await getTwitterAccount(twitterClient);
            } catch (e) {
                throw new AppError(401, `Twitter error: ${_.get(e, '[0].message')}`);
            }

            return res.id;
    }
    return false;
};

function getTwitterAccount(twitterClient){
    return new Bluebird(function(resolve, reject){
        twitterClient.get('account/verify_credentials', function (e, res) {
            if(e){ return reject(e) }
            resolve(res)
        });
    });
}

export default {
    getClientId
}

