'use strict';

import * as _ from 'lodash';

export const roles:any = {
    SUPER_ADMIN: 'super',
    ADMIN: 'admin',
    CHARITY: 'charity',
    PUBLISHER: 'publisher',
    PUBLISHER_PENDING: 'publisher_pending',
    USER: 'user'
};

const check = function (user = {}, reqPermission) {

    const permissions = {};

    permissions[roles.USER] = 1;
    permissions[roles.PUBLISHER_PENDING] = 2;
    permissions[roles.PUBLISHER] = 3;
    permissions[roles.CHARITY] = 4;
    permissions[roles.ADMIN] = 10;
    permissions[roles.SUPER_ADMIN] = 20;

    let role = _.get(user, "role");
    return _.get(permissions, role, 0) >= permissions[reqPermission];
};

const roleIsAdmin = role => {
    return _.includes([roles.SUPER_ADMIN, roles.ADMIN], role)
};


export default {
    check,
    roleIsAdmin
};