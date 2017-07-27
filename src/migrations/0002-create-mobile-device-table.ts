'use strict';

import models from '../models';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('mobile_device', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER
            },
            platform: {
                type: Sequelize.STRING
            },
            uuid: {
                type: Sequelize.TEXT
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