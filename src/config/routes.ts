'use strict';

import * as Router from 'koa-router';
import authenticate from '../api/middlewares/authenticate';
import {roles} from '../api/services/auth/PermissionService';
import ActionHookService from '../api/services/ActionHookService';

import omitFields from '../api/middlewares/omitFields';
import checkPermissions from '../api/middlewares/checkPermissions';
import checkEntity from "../api/middlewares/checkEntity";
import filterById from "../api/middlewares/filterById";

import GetList from "../api/actions/GetList";
import GetOne from "../api/actions/GetOne";
import Update from "../api/actions/Update";
import Create from "../api/actions/Create";
import BulkCreate from "../api/actions/BulkCreate";
import Remove from "../api/actions/Remove";
import BulkRemove from "../api/actions/BulkRemove";

import AccountController from '../api/controllers/v1/AccountController';
import AuthController from '../api/controllers/v1/AuthController';
import UserController from '../api/controllers/v1/UserController';
import AWSWebhookController from '../api/controllers/v1/AWSWebhookController';

let router = new Router({
    prefix: '/api'
});

router.use(authenticate);

router.get('/ping', (ctx) => ctx.body = 'pong');

// Auth
router
    .post('/v1/signin', AuthController.signin)
    .post('/v1/signin/:provider', AuthController.signinSocial)
    .post('/v1/signup', AuthController.signup)
    .post('/v1/signup/confirm', AuthController.signupConfirmation)
    .post('/v1/refresh_token', AuthController.refreshToken)
    .post('/v1/notification/email/disable', AuthController.emailNotificationDisableConfirmation)
    .post('/v1/reset_password/:email', AuthController.requestResetPassword)
    .post('/v1/set_password/:token', AuthController.resetPassword)
;

// webhooks
router
    .post('/v1/webhook/aws', AWSWebhookController.handleIncomingSNS)
;

// Account
router
    .get('/v1/account', checkPermissions(roles.USER), AccountController.getProfile)
    .put('/v1/account', checkPermissions(roles.USER), omitFields(['id', 'type']), AccountController.updateProfile)
    .post('/v1/account/image/upload', checkPermissions(roles.USER), AccountController.createUploadUrl)
;

// [ADMIN, USER] Manage users
router
    .get('/v1/user', checkPermissions(roles.USER),  GetList('User'))
    .get('/v1/user/:id', checkPermissions(roles.USER), GetOne('User'))
    .post('/v1/user', checkPermissions(roles.USER), Create('User'))
    .post('/v1/user/bulk/create', checkPermissions(roles.ADMIN), BulkCreate('User'))
    .put('/v1/user/:id', checkPermissions(roles.ADMIN), omitFields(['id']), Update('User'))
    .delete('/v1/user/:id', checkPermissions(roles.ADMIN), Remove('User'))
    .post('/v1/user/bulk/remove', checkPermissions(roles.ADMIN), BulkRemove('User'))
    .put('/v1/user/bulk/status', checkPermissions(roles.ADMIN), UserController.setStatus)
;


export default router;