'use strict';

import config from '../../config/app';
import logger from '../../config/logger';
import models from '../../models';
import AppError from '../services/AppError';
import ActionHookService from '../services/ActionHookService';
import * as Ajv from 'ajv';
import * as _ from 'lodash';
import * as isPromise from 'ispromise';


export default (modelName, options = {before: [], after: []}) => {

    let {before, after} = options;

    if(_.isUndefined(before)) {before = []}
    if(_.isUndefined(after)) {before = []}

    const model = models[modelName];

    if(!model) { throw new AppError(500, `Model with name ${modelName} doesn't exist.`) }

    const ajv = Ajv({allErrors: true});

    return async function (ctx) {

        if(!_.isObject(ctx.request.body) || _.isEmpty(ctx.request.body)){ throw new AppError(400, `Body shouldn't be empty.`)}

        let data:any = ctx.request.body;

        // process additional specific verifications
        if (_.size(before) > 0) {
            for(let i in before){
                const beforeResult = before[i](ctx, entityRow); // could throw an exception if something is wrong
                entityRow = isPromise(beforeResult) ? await beforeResult : beforeResult;
            }
        }

        const schema = model.schema;
        if(schema) {
            let valid = ajv.validate(schema, data);
            if (!valid) {throw new AppError(400, ajv.errorsText(), ajv.errors.toString())}
        } else {
            logger.warn(`Model ${modelName} doesn't have defined validation schema`)
        }

        let entity = await model.create(data);

        // process additional specific verifications
        if (_.size(after) > 0) {
            for(let i in after){
                const afterResult = after[i](ctx, entity); // could throw an exception if something is wrong
                entity = isPromise(afterResult) ? await afterResult : afterResult;
            }
        }

        ctx.state[_.toLower(modelName)] = entity;

        ctx.status = 201;
        ctx.body = {data: entity};

        logger.info(`Created new record of ${modelName}`);

        return ctx;
    }
};