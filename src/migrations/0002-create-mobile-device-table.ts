'use strict';

import models from '../models';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('mobile_device', {
            uuid: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            userId: {
                type: Sequelize.INTEGER
            },
            platform: {
                type: Sequelize.STRING,
                allowNull: false
            },
            token: {
                type: Sequelize.STRING
            },
            endpointArn: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });


    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('mobile_device');
    }
};