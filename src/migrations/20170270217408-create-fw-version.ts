'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('fw_update', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            priority: {
                type: Sequelize.STRING,
            },
            version: {
                type: Sequelize.STRING,
            },
            linkUrl: {
                type: Sequelize.STRING,
            },
            description: {
                allowNull: true,
                type: Sequelize.TEXT,
            },
            deletedAt: {
                type: Sequelize.DATE
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        });
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.dropTable('fw_update');
    }
};