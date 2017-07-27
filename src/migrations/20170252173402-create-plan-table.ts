'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {

        return queryInterface.createTable('plan', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            planKeyId: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING
            },
            interval: {
                type: Sequelize.STRING
            },
            currency: {
                type: Sequelize.STRING
            },
            amount: {
                type: Sequelize.DECIMAL
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
        return queryInterface.dropTable('plan');
    }
};