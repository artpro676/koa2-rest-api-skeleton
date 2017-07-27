'use strict';

import models from '../models';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('beam_device', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER
            },
            mobileDeviceId: {
                type: Sequelize.INTEGER
            },
            uuid: {
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
        return queryInterface.dropTable('beam_device');
    }
};