'use strict';

import config from '../../config/app';
import logger from '../../config/logger';
import models from '../../models';
import AppError from '../services/AppError';
import QueryFilterService from '../services/QueryFilterService';
import Utils from '../services/Utils';
import ActionHookService from '../services/ActionHookService';
import * as _ from 'lodash';

export default (modelName, options:any = {preProcessors: [], paramName: 'id', showDeleted: false}) => {

    let {preProcessors, paramName, showDeleted} = options;

    if(_.isUndefined(preProcessors)){ preProcessors = [] }
    if(!paramName){ paramName = 'id' }
    if(_.isUndefined(showDeleted)){ showDeleted = false }


    const model = models[modelName];

    if (!model) { throw new AppError(500, `Model with name ${modelName} doesn't exist.`) }

    return async function (ctx) {

        let options:any = {
            where: _.set({}, paramName, ctx.params[paramName]),
            include: QueryFilterService.parseInclude(ctx, model),
            attributes: QueryFilterService.parseFields(ctx, model)
        };

        // add extra fields, which could be defined in models.
        // this fields could be defined as functions.
        // also we need to consolidate these with reqeusted list of fields.
        if (model.extraFields && _.isFunction(model.extraFields)) {
            let extraFields = model.extraFields();
            if (_.size(options.attributes) > 0) {
                extraFields = _.pick(extraFields, options.attributes);
                options.attributes = _.chain(options.attributes)
                    .intersection(_.keys(model.attributes))
                    .concat(Utils.mapAnyRows(extraFields, ctx))
                    .value();
            } else {
                options.attributes = {include: Utils.mapAnyRows(extraFields, ctx)};
            }
        }

        // skip attributes in query if its empty to avoid empty result
        if (_.size(options.attributes) == 0) { delete options.attributes }

        if(showDeleted){options.paranoid = !showDeleted}

        // show deleted record for admin
        if(_.get(ctx, 'state.user') && ctx.state.user.isAdmin()){
            options.paranoid = false;
        }

        let entityRow = await model.scope('defaultScope').findOne(options);

        if (!entityRow) {throw new AppError(404, `Entity of ${modelName} not found!`);}

        // process additional specific verifications
        if (_.size(preProcessors) > 0) {
            _.each(preProcessors, preProcess => {
                entityRow = preProcess(ctx, entityRow); // could throw an exception if something is wrong
            })
        }

        ctx.body = {data: entityRow};

        logger.info(`Found one record of ${modelName} by request `, ctx.query);
    }
};
