'use strict';

import {roles} from '../api/services/auth/PermissionService'
// import {statuses} from '../models/User'
import models from '../models'
const statuses  = models.User.statuses;

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('user', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            username: {
                type: Sequelize.STRING
            },
            firstName: {
                type: Sequelize.STRING
            },
            lastName: {
                type: Sequelize.STRING
            },
            email: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
            },
            role: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: roles.USER
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: statuses.NEW
            },
            bio: {
                type: Sequelize.TEXT
            },
            gender: {
                type: Sequelize.STRING
            },
            dob: {
                type: Sequelize.DATEONLY
            },
            enableEmailNotification: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            emailVerified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            imageFileName: {
                type: Sequelize.STRING,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            deletedAt: {
                allowNull: true,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });


    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('user');
    }
};