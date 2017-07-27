'use strict';

import PermissionService from '../services/auth/PermissionService';
import AppError from '../services/AppError';

export default (allowedPermissions) => {
	return function(ctx, next) {
		if (PermissionService.check(ctx.state.account, allowedPermissions)) {
			return next();
		} else {
			throw new AppError(403, 'You have not an access to perform this action!');
		}
	};
};
