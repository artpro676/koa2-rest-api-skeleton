'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addIndex('post', ['userId'], {indexName: 'post_user_id_index'});
        // await queryInterface.addIndex('post', ['beamId'], {indexName: 'post_user_id_index'});

        await queryInterface.addIndex('beam', ['userId'], {indexName: 'beam_user_id_index'});

        await queryInterface.addIndex('event', ['userId'], {indexName: 'event_user_id_index'});

        await queryInterface.addIndex('follow', ['followerId'], {indexName: 'following_id_index'});
        await queryInterface.addIndex('follow', ['followingId'], {indexName: 'follower_id_index'});

        await queryInterface.addIndex('donation', ['beamId'], {indexName: 'donation_beam_id_index'});
        await queryInterface.addIndex('donation', ['userId'], {indexName: 'donation_user_id_index'});

        await queryInterface.addIndex('content_key', ['userId'], {indexName: 'content_key_user_id_index'});
        await queryInterface.addIndex('content_key', ['beamId'], {indexName: 'content_key_beam_id_index'});
        await queryInterface.addIndex('content_key', ['postId'], {indexName: 'content_key_post_id_index'});

        await queryInterface.addIndex('comment', ['postId'], {indexName: 'comment_post_id_index'});
        await queryInterface.addIndex('comment', ['beamId'], {indexName: 'comment_beam_id_index'});
        await queryInterface.addIndex('comment', ['userId'], {indexName: 'comment_user_id_index'});

        await queryInterface.addIndex('content_like', ['userId'], {indexName: 'content_like_user_id_index'});
        await queryInterface.addIndex('content_like', ['postId'], {indexName: 'content_like_post_id_index'});
        await queryInterface.addIndex('content_like', ['beamId'], {indexName: 'content_like_beam_id_index'});

        await queryInterface.addIndex('saved_content', ['userId'], {indexName: 'saved_content_user_id_index'});
        await queryInterface.addIndex('saved_content', ['postId'], {indexName: 'saved_content_post_id_index'});
        await queryInterface.addIndex('saved_content', ['beamId'], {indexName: 'saved_content_beam_id_index'});

        await queryInterface.addIndex('user_black_list', ['userId'], {indexName: 'user_black_list_user_id_index'});
        await queryInterface.addIndex('beam_black_list', ['userId'], {indexName: 'beam_black_list_user_id_index'});

        await queryInterface.addIndex('beam_device', ['userId'], {indexName: 'beam_device_user_id_index'});

        await queryInterface.addIndex('content_link_hash', ['userId'], {indexName: 'content_link_hash_user_id_index'});
        await queryInterface.addIndex('content_link_hash', ['postId'], {indexName: 'content_link_hash_post_id_index'});
        await queryInterface.addIndex('content_link_hash', ['beamId'], {indexName: 'content_link_hash_beam_id_index'});
        await queryInterface.addIndex('content_link_hash', ['hash'], {indexName: 'content_link_hash_hash_id_index'});

        await queryInterface.addIndex('content_share', ['userId', 'beamId'], {indexName: 'content_share_user_beam_id_index'});
        await queryInterface.addIndex('content_share', ['userId', 'postId'], {indexName: 'content_share_user_post_id_index'});

        await queryInterface.addIndex('mobile_device', ['uuid', 'platform'], {indexName: 'mobile_device_uuid_platform_index'});

        await queryInterface.addIndex('token', ['type', 'value'], {indexName: 'token_type_value_index'});

        await queryInterface.addIndex('user_auth', ['userId'], {indexName: 'user_auth_user_id_index'});

        await models.sequelize.query('CREATE INDEX beam_tags_index ON "beam" USING GIN ("tags")');
        await models.sequelize.query('CREATE INDEX interest_tags_index ON "interest" USING GIN ("tags")');
        await models.sequelize.query('CREATE INDEX appeals_tags_index ON "appeal" USING GIN ("tags")');
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeIndex('post', 'post_user_id_index');

        await queryInterface.removeIndex('post', 'post_user_id_index');
        // await queryInterface.addIndex('post', ['beamId'], {indexName: 'post_user_id_index');

        await queryInterface.removeIndex('beam', 'beam_user_id_index');

        await queryInterface.removeIndex('event', 'event_user_id_index');

        await queryInterface.removeIndex('follow',  'following_id_index');
        await queryInterface.removeIndex('follow',  'follower_id_index');

        await queryInterface.removeIndex('donation', 'donation_beam_id_index');
        await queryInterface.removeIndex('donation', 'donation_user_id_index');

        await queryInterface.removeIndex('content_key','content_key_user_id_index');
        await queryInterface.removeIndex('content_key','content_key_beam_id_index');
        await queryInterface.removeIndex('content_key','content_key_post_id_index');

        await queryInterface.removeIndex('comment', 'comment_post_id_index');
        await queryInterface.removeIndex('comment',  'comment_beam_id_index');
        await queryInterface.removeIndex('comment',  'comment_user_id_index');

        await queryInterface.removeIndex('content_like', 'content_like_user_id_index');
        await queryInterface.removeIndex('content_like', 'content_like_post_id_index');
        await queryInterface.removeIndex('content_like', 'content_like_beam_id_index');

        await queryInterface.removeIndex('saved_content','saved_content_user_id_index');
        await queryInterface.removeIndex('saved_content', 'saved_content_post_id_index');
        await queryInterface.removeIndex('saved_content', 'saved_content_beam_id_index');

        await queryInterface.removeIndex('user_black_list','user_black_list_user_id_index');
        await queryInterface.removeIndex('beam_black_list', 'beam_black_list_user_id_index');

        await queryInterface.removeIndex('beam_device', 'beam_device_user_id_index');

        await queryInterface.removeIndex('content_link_hash', 'content_link_hash_user_id_index');
        await queryInterface.removeIndex('content_link_hash', 'content_link_hash_post_id_index');
        await queryInterface.removeIndex('content_link_hash', 'content_link_hash_beam_id_index');
        await queryInterface.removeIndex('content_link_hash', 'content_link_hash_hash_id_index');

        await queryInterface.removeIndex('content_share','content_share_user_beam_id_index');
        await queryInterface.removeIndex('content_share',  'content_share_user_post_id_index');

        await queryInterface.removeIndex('mobile_device', 'mobile_device_uuid_platform_index');

        await queryInterface.removeIndex('token', 'token_type_value_index');

        await queryInterface.removeIndex('user_auth', 'user_auth_user_id_index');

        await queryInterface.removeIndex('beam', 'beam_tags_index');
        await queryInterface.removeIndex('interest', 'interest_tags_index');
        await queryInterface.removeIndex('appeal', 'appeals_tags_index');
    }
};