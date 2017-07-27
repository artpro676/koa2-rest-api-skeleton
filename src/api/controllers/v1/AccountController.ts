'use strict';

import GetOne from '../../actions/GetOne';
import GetList from '../../actions/GetList';
import config from '../../../config/app';
import logger from '../../../config/logger';
import models from '../../../models';
import AppError from '../../services/AppError';
import {roles} from '../../services/RoleService';
import MobileDeviceService from '../../services/MobileDeviceService';
import EmailService from '../../services/EmailService';
import QueryFilterService from '../../services/QueryFilterService';
import BeamDeviceService from '../../services/BeamDeviceService';
import * as Ajv from 'ajv';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Bluebird from "bluebird";

const ajv = Ajv({allErrors: true});

/**
 * Get users profile data
 * get /account
 * @param ctx
 */
const getProfile = function (ctx) {
    const action = GetOne('User');
    ctx.params.id = ctx.state.user.id;
    return action(ctx);
};

/**
 * Set user's profile data
 * put /account
 * @param ctx
 */
const updateProfile = async function (ctx) {

    const user = ctx.state.user;
    const data = ctx.request.body;
    const schema = models.User.schema;

    delete schema.required;

    let valid = ajv.validate(schema, data);
    if (!valid) {throw new AppError(400, ajv.errorsText(), ajv.errors.toString())}

    if (config.minAllowedAge && data.dob) {
        // validate age of user before signup
        var now = moment(new Date());
        var end = moment(data.dob);
        var duration = moment.duration(now.diff(end));
        var years = duration.asYears();

        if (years < config.minAllowedAge) {throw new AppError(403, `You should be older than ${config.minAllowedAge}.`)}
    }

    const [count, updatedUser] = await models.User.update(data, {
        where: {id: user.id},
        returning: true,
        individualHooks: true,
        limit: 1
    });

    // const newUser = await models.User.findById(user.id);

    ctx.body = {data: updatedUser[0]};
};

/**
 * Create presign url to upload image to S3
 * post /account/picture/upload
 * @param ctx
 */
const createUploadUrl = function (ctx) {
    const name = ctx.request.body.name;
    ctx.body = {data: ctx.state.user.createUploadUrl(name)};
};


/**
 * post /account/destroy
 */
const deleteUser = async function(ctx) {

    const user = ctx.state.user;

    if(_.get(ctx, 'request.body.description')){
        await models.User.update({
            deleteDescription: ctx.request.body.description
        }, {
            where: {id: user.id}
        });

        await EmailService.sendTemplate('alert', config.email.supportEmails, {
            title: `${user.fullname} has been removed`,
            message: ctx.request.body.description
        });
    }

    const result = await user.destroy();


    ctx.body = {data: result}
};

export default {
    getProfile,
    updateProfile,
    createUploadUrl,
    deleteUser
};