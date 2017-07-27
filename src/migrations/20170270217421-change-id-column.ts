'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam_black_list', 'id');
        await queryInterface.removeColumn('beam_device', 'id');
        await queryInterface.removeColumn('comment', 'id');
        await queryInterface.addColumn('comment', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT});
        await queryInterface.removeColumn('content_like', 'id');
        await queryInterface.removeColumn('content_link_hash', 'id');
        await queryInterface.removeColumn('content_share', 'id');
        await queryInterface.removeColumn('email_blacklist', 'id');
        await queryInterface.removeColumn('follow', 'id');
        await queryInterface.removeColumn('token', 'id');
        await queryInterface.removeColumn('saved_content', 'id');
        await queryInterface.removeColumn('event', 'id');
        await queryInterface.addColumn('event', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT});
        await queryInterface.changeColumn('user', 'lastEventId', {type: Sequelize.BIGINT});
        await queryInterface.removeColumn('donation', 'id');
        await queryInterface.addColumn('donation', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT});

        const lastEvent = await models.Event.scope(['lastItem']).findOne();
        await models.User.update({lastEventId:lastEvent.id}, {where: {}});

    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam_black_list', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});
        await queryInterface.addColumn('beam_device', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});
        await queryInterface.removeColumn('comment', 'id');
        await queryInterface.addColumn('comment', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});
        await queryInterface.addColumn('content_like', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});
        await queryInterface.addColumn('content_link_hash', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});
        await queryInterface.addColumn('content_share', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});
        await queryInterface.addColumn('email_blacklist', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});
        await queryInterface.addColumn('follow', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});
        await queryInterface.addColumn('token', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});
        await queryInterface.addColumn('saved_content', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});
        await queryInterface.removeColumn('event', 'id');
        await queryInterface.addColumn('event', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});
        await queryInterface.removeColumn('donation', 'id');
        await queryInterface.addColumn('donation', 'id', {allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER});

        const lastEvent = await models.Event.scope(['lastItem']).findOne();
        await models.User.update({lastEventId:lastEvent.id}, {where: {}});
    }
};