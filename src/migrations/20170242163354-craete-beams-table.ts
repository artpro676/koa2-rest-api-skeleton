'use strict';

import models from '../models';

module.exports = {
    up: function(queryInterface, Sequelize) {

        return queryInterface.createTable('beam', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            type: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.STRING
            },
            title: {
                type: Sequelize.STRING
            },
            description: {
                type: Sequelize.TEXT
            },
            linkUrl: {
                type: Sequelize.TEXT
            },
            hasDonation: {
                type: Sequelize.BOOLEAN
            },
            donationAmount: {
                type: Sequelize.DECIMAL
            },
            tags: {
                type: Sequelize.ARRAY(Sequelize.STRING)
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
    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('beam');
    }
};