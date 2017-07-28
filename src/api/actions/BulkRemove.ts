'use strict';

import config from '../../config/app';
import logger from '../../config/logger';
import models from '../../models';
import AppError from '../services/AppError';
import ActionHookService from '../services/ActionHookService';
import QueryFilterService from '../services/QueryFilterService';
import * as _ from 'lodash';
import * as isPromise from 'ispromise';

export default (modelName, options = {before: [ActionHookService.checkOwnerAccess()]}) => {

    if(_.isUndefined(before)) {before = []}

    const model = models[modelName];

    if (!model) { throw new AppError(500, `Model with name ${modelName} doesn't exist.`) }

    return async function (ctx) {

        let idList = ctx.request.body.id;

        if (_.size(idList) == 0) { throw new AppError(400, 'List of IDs should not be empty') }
        if (modelName === 'User' && _.includes(idList, ctx.state.account.id)) { throw new AppError(400, 'You can\'t remove yourself!') }

        let instances = await model.findAll({where: {id: {$in: idList}}});

        // process additional specific verifications
        if (_.size(before) > 0) {
            for(let i in before){
                const beforeResult = before[i](ctx, entityRow); // could throw an exception if something is wrong
                entityRow = isPromise(beforeResult) ? await beforeResult : beforeResult;
            }
        }

        let count = await model.destroy({where: {id: {$in: idList}}});

        ctx.body = {data: {count}};

        logger.info(`Removed ${count} rows of model ${modelName}`);
    }
};