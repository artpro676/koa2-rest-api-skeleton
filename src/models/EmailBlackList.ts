'use strict';

import logger from '../config/logger';
import config from '../config/app';
import * as uuid from 'uuid';
import * as _ from 'lodash';

export default function (sequelize, DataTypes) {

    const types = {
        BOUNCE : 'bounce',
        COMPLAINT : 'complaint',
    };

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

    const instanceMethods = {};

    const options = {
        instanceMethods,
        timestamps: true,
        freezeTableName: true,
        classMethods: {
            types,
            //associate(models) {},
        }
    };

    return sequelize.define('email_black_list', fields, options)
}