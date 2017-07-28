'use strict';

import config from '../../config/app';
import * as _ from 'lodash';
import logger from '../../config/logger';
import models from '../../models';
import AppError from '../services/AppError';
import Utils from '../services/Utils';
import QueryFilterService from '../services/QueryFilterService';
import * as isPromise from 'ispromise';

export default (modelName, options:any = {scopes: ['defaultScope'], showDeleted: false, countMethod: false, countDistinct: true}) => {

    let {scopes, countDistinct, countMethod, showDeleted} = options;

    if(_.isUndefined(scopes)) {scopes = ['defaultScope']}
    if(_.isUndefined(countDistinct)) {countDistinct = true}
    if(_.isUndefined(countMethod)) {countMethod = false}
    if(_.isUndefined(showDeleted)) {showDeleted = false}

    const model = models[modelName];

    if (!model) { throw new AppError(500, `Model with name ${modelName} doesn't exist.`) }

    return async function (ctx) {

        let options = QueryFilterService.parseAll(ctx, model);
        // add extra fields, which could be defined in models.
        // this fields could be defined as functions.
        // also we need to consolidate these with requested list of fields.
        if (model.extraFields && _.isFunction(model.extraFields)) {
            let extraFields = model.extraFields();
            if (options.attributes && _.size(options.attributes) > 0) {
                extraFields = _.pick(extraFields, options.attributes);
                options.attributes = _.chain(options.attributes)
                    .intersection(_.keys(model.attributes))
                    .concat(Utils.mapAnyRows(extraFields, ctx))
                    .value();
            } else {
                options.attributes = {include: Utils.mapAnyRows(extraFields, ctx)};
            }
        }

        if(!_.isUndefined(showDeleted)){options.paranoid = !showDeleted}

        if(_.isUndefined(scopes)){scopes = ['defaultScope']}

        const newScopes = _.map(scopes, function (scope:any) {
            if (_.isString(scope)) { return scope }

            if (_.isObject(scope)) {
                return {method: _.compact([scope.method, _.get(ctx, scope.key), scope.models])}
            }
        });

        // console.log(options);
        // ctx.body = await model.scope(_.compact(newScopes)).findAndCountAll(options);
        const build = model.scope(_.compact(newScopes));
        const optionsCopy = _.cloneDeep(options);

        let count = 0;

        if(!!countMethod){

            options.plain = true;
            options.includeIgnoreAttributes = false;
            options.attributes = [[countMethod, 'count']];

            // No limit, offset, order or attributes for the options max be given to count()
            // Set them to null to prevent scopes setting those values
            options.limit = null;
            options.offset = null;
            options.order = null;

            const counterBuild = _.cloneDeep(build);
            counterBuild.primaryKeyAttribute = null;

            const countResult = await counterBuild.findOne(options);

            count = _.toInteger(_.get(countResult, 'dataValues.count', 0));
        } else {
            count = await build.count(_.chain(options)
                .set('distinct', _.isUndefined(countDistinct) ? true : countDistinct)
                .omit('attributes')
                .value());
        }

        let rows = [];
        if(count > 0) {rows = await build.findAll(_.set(optionsCopy, 'individualHooks', true))}

        ctx.body = {count, rows};

        logger.info(`Found ${ctx.body.count} records of ${modelName} by request `, ctx.query);
    }
};
