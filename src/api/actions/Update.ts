'use strict';

import config from '../../config/app';
import logger from '../../config/logger';
import models from '../../models';
import AppError from '../services/AppError';
import ActionHookService from '../services/ActionHookService';
import * as Ajv from 'ajv';
import * as _ from 'lodash';
import * as isPromise from 'ispromise';

export default (modelName, options:any = {}) => {

    let {before, paramName, showDeleted} = options;

    if(_.isUndefined(before)){ before = [ActionHookService.checkOwnerAccess()] }
    if(!paramName){ paramName = 'id' }
    if(_.isUndefined(showDeleted)){ showDeleted = false }

    const model = models[modelName];

    if (!model) { throw new AppError(500, `Model with name ${modelName} doesn't exist.`) }

    const ajv = Ajv({allErrors: true});

    return async function (ctx) {

        const data = ctx.request.body;
        const where = _.set({}, paramName, ctx.params[paramName]);

        const findOptions:any = {where};
        if(showDeleted){findOptions.paranoid = !showDeleted}

        // check entity
        let entityRow = ctx.state[_.camelCase(modelName)] || await model.findOne(findOptions);
        if (!entityRow) throw new AppError(404, `${modelName} not found`);

        logger.info(`Found one record`);

        // validation part
        const schema = model.schema;
        if (schema) {
            delete schema.required;

            let valid = ajv.validate(schema, data);
            if (!valid) {throw new AppError(400, ajv.errorsText(), ajv.errors.toString())}
        } else {
            logger.warn(`Model ${modelName} doesn't have defined validation schema`)
        }

        // process additional specific verifications
        if (_.size(before) > 0) {
            for(let i in before){
                const beforeResult = before[i](ctx, entityRow); // could throw an exception if something is wrong
                entityRow = isPromise(beforeResult) ? await beforeResult : beforeResult;
            }
        }

        let updateOptions:any = {where, limit: 1, individualHooks: true, returning: true, paranoid: false};

        let result;
        if(!!entityRow.deletedAt){
            await models.sequelize.transaction(async(transaction) => {
                await model.restore({where, transaction});
                result = await model.update(data, _.merge({}, updateOptions, {transaction}));
                await model.destroy({where, transaction, limit: 1});
            });
        } else {
            result = await model.update(data, updateOptions);
        }

        const [count, results] = result;

        ctx.body = {data: {count, results}};

        logger.info(`Updated record of ${modelName} by query : ${JSON.stringify(where)}`, `Body : ${JSON.stringify(data)}`);

        return ctx;
    }
};