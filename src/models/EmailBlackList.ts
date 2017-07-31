'use strict';

import logger from '../config/logger';
import config from '../config/app';
import * as uuid from 'uuid';
import * as _ from 'lodash';

export const types = {
    BOUNCE : 'bounce',
    COMPLAINT : 'complaint',
};

export default function (sequelize, DataTypes) {

    const TABLE_NAME = 'email_black_list';

    const fields = {
        email: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        reasonType: {
            type: DataTypes.STRING,
            defaultValue: types.COMPLAINT
        }
    };

    const classMethods = {
        types
    };

    const options = {
        timestamps: true,
        freezeTableName: true,
    };

    return _.merge(sequelize.define(TABLE_NAME, fields, options), classMethods)
}