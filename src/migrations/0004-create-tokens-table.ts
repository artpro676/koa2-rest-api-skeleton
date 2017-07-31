'use strict';

import models from '../models';

module.exports = {
    up: function(queryInterface, Sequelize) {

        return queryInterface.createTable('token', {
            userId: {
                type: Sequelize.INTEGER
            },
            userAuthId: {
                type: Sequelize.INTEGER
            },
            type: {
                type: Sequelize.STRING,
            },
            authType: {
                type: Sequelize.STRING,
                defaultValue: models.Token.authTypes.OTHER
            },
            value: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            expiresAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: models.sequelize.literal(`(now() + interval '1 hour')`)
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
        return queryInterface.dropTable('token');
    }
};