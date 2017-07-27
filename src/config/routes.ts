'use strict';

import * as Router from 'koa-router';
import authenticate from '../api/middlewares/authenticate';
import {roles} from '../api/services/RoleService';
import EmailService from '../api/services/EmailService';
import SNSService from '../api/services/SNSService';
import ActionService from '../api/services/ActionService';

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
import ContentLikeController from '../api/controllers/v1/ContentLikeController';
import CommentController from '../api/controllers/v1/CommentController';
import AuthController from '../api/controllers/v1/AuthController';
import UserController from '../api/controllers/v1/UserController';
import BeamController from '../api/controllers/v1/BeamController';
import FeedbackController from '../api/controllers/v1/FeedbackController';
import FollowController from '../api/controllers/v1/FollowController';
import SubscriptionController from '../api/controllers/v1/SubscriptionController';
import StreamController from '../api/controllers/v1/StreamController';
import EventController from '../api/controllers/v1/EventController';
import AWSWebhookController from '../api/controllers/v1/AWSWebhookController';
import PostController from '../api/controllers/v1/PostController';
import MigrateController from '../api/controllers/v1/MigrateController';
import UserAuthController from '../api/controllers/v1/UserAuthController';
import ContentController from '../api/controllers/v1/ContentController';
import CrowdRiseController from '../api/controllers/v1/CrowdRiseController';
import ContentHashController from '../api/controllers/v1/ContentHashController';
import NotificationController from '../api/controllers/v1/NotificationController';
import BeamDeviceController from '../api/controllers/v1/BeamDeviceController';

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
    .post('/v1/refresh_token', AuthController.refreshToken)
    .post('/v1/signup/confirm', AuthController.signupConfirmation)
    .post('/v1/notification/disable', AuthController.notificationDisableConfirmation);

// webhook
router
    .post('/v1/webhook/sns', AWSWebhookController.handleIncomingSNS)
    .get('/v1/webhook/crowdrise_auth', CrowdRiseController.authWebhook);

// Account
router
    .get('/v1/account', checkPermissions(roles.USER), AccountController.getProfile)
    .put('/v1/account', checkPermissions(roles.USER), omitFields(['id', 'type']), AccountController.updateProfile)
    .post('/v1/account/reset_password/:email', AuthController.resetPassword)
    .post('/v1/account/set_password/:token', AuthController.setPassword)
    .post('/v1/account/picture/upload', checkPermissions(roles.USER), AccountController.createUploadUrl)
    .get('/v1/account/event', checkPermissions(roles.USER), EventController.getEvents)
    .get('/v1/account/event/unread_count', checkPermissions(roles.USER), EventController.getEventsUnreadCount)
    .get('/v1/account/event/last', checkPermissions(roles.USER), EventController.getLastUpdates)
    .post('/v1/account/event/reset', checkPermissions(roles.USER), EventController.resetLastEvent)
    .post('/v1/account/destroy', checkPermissions(roles.USER), AccountController.deleteUser)
    .get('/v1/account/auth', checkPermissions(roles.USER), filterById('state.user.id', 'userId'), GetList('UserAuth'))
    .get('/v1/account/auth/:provider', checkPermissions(roles.USER), UserAuthController.getUserAuth('state.user.id'))
    .post('/v1/account/auth/:provider', checkPermissions(roles.USER), UserAuthController.setUserAuth('state.user.id'))
    .delete('/v1/account/auth/:provider', checkPermissions(roles.USER), UserAuthController.removeUserAuth('state.user.id'))
;

// [ADMIN, USER] Manage users
router
    .get('/v1/user', checkPermissions(roles.USER), UserController.getUserList)
    .get('/v1/user/:id', checkPermissions(roles.USER), GetOne('User'))
    .post('/v1/user', checkPermissions(roles.USER), Create('User'))
    .post('/v1/user/bulk/create', checkPermissions(roles.ADMIN), BulkCreate('User'))
    .put('/v1/user/:id', checkPermissions(roles.ADMIN), omitFields(['id']), Update('User'))
    .delete('/v1/user/:id', checkPermissions(roles.ADMIN), Remove('User'))
    .post('/v1/user/bulk/remove', checkPermissions(roles.ADMIN), BulkRemove('User'))
    .put('/v1/user/bulk/status', checkPermissions(roles.ADMIN), UserController.setStatus)
    .put('/v1/user/:id/publisher_request/:action', checkPermissions(roles.ADMIN), checkEntity('User'), UserController.processPublisherRequest)
    .post('/v1/user/:id/super_following', checkPermissions(roles.ADMIN), UserController.setPermanentFollowing(true))
    .delete('/v1/user/:id/super_following', checkPermissions(roles.ADMIN), UserController.setPermanentFollowing(false))
;

// [USER] Black lists
router
    .post('/v1/user/:id/block', checkPermissions(roles.USER), checkEntity('User'), UserController.addToBlackList)
    .delete('/v1/user/:id/block', checkPermissions(roles.USER), checkEntity('User'), UserController.removeFromBlackList)
    .post('/v1/beam/:id/block', checkPermissions(roles.USER), checkEntity('Beam'), BeamController.addToBlackList)
    .delete('/v1/beam/:id/block', checkPermissions(roles.USER), checkEntity('Beam'), BeamController.removeFromBlackList)
    .post('/v1/post/:id/block', checkPermissions(roles.USER), checkEntity('Post'), PostController.addToBlackList)
    .delete('/v1/post/:id/block', checkPermissions(roles.USER), checkEntity('Post'), PostController.removeFromBlackList)
;

export default router;