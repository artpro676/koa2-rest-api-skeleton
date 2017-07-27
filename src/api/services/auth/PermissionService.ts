'use strict';

import * as _ from 'lodash';

export const roles:any = {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest'
};

const check = function (user = {}, reqPermission) {

    const permissions = {};

    permissions[roles.GUEST] = 0;
    permissions[roles.USER] = 1;
    permissions[roles.ADMIN] = 10;

    let role = _.get(user, "role");
    return _.get(permissions, role, 0) >= permissions[reqPermission];
};

export default {
    check,
    roleIsAdmin
};