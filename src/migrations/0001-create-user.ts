'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('user', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            firstName: {
                type: Sequelize.STRING
            },
            lastName: {
                type: Sequelize.STRING
            },
            password: {
                type: Sequelize.STRING
            },
            email: {
                type: Sequelize.STRING
            },
            role: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.STRING
            },
            picture: {
                type: Sequelize.STRING
            },
            bio: {
                type: Sequelize.TEXT
            },
            dob: {
                type: Sequelize.DATE
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