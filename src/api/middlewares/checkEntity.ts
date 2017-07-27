'use strict';

import * as _ from 'lodash';
import logger from '../../config/logger';
import models from '../../models';
import AppError from '../services/AppError';

const checkEntity = (entity, options:any = {}) => async function (ctx, next) {
    let {param, postVerificators, showDeleted} = options;

    if(!param) { param = 'id' }
    if(!postVerificators) { postVerificators = [] }
    if(_.isUndefined(showDeleted)) {
        if(_.get(ctx, 'state.user') && ctx.state.user.isAdmin()){
            showDeleted = true;
        } else {
            showDeleted = false;
        }
    }

    let modelName = entity;
    let optionalParam: any = false;

    if (_.isObject(param)) {
        const keys = _.keysIn(param);
        optionalParam = keys[0] || 'id';
        param = param[optionalParam];
    }

    logger.info(`[checkEntity] ${entity}, ${param}`);

    /** if current logged in person requests his self */
    if (entity === 'User' && param === 'self') {
        ctx.state.account = ctx.state.user;
        return next();
    }

    let entityId = ctx.params[optionalParam || param];

    if (!models[modelName]) throw new AppError(404, 'Entity not found!');

    let entityRow = await models[modelName].find({
        where: _.set({}, param, entityId),
        limit: 1,
        paranoid: false
    });

    if (!entityRow) throw new AppError(404, 'Entity not found!');

    // process additional specific verifications
    if(_.size(postVerificators) > 0) {
        _.each(postVerificators, verificator => {
            verificator(ctx, entityRow); // could throw an exception if something is wrong
        })
    }

    const entityName = (entity === 'User') ? 'account' : _.camelCase(entity);
    ctx.state[entityName] = entityRow;

    return next();
};

export default checkEntity;