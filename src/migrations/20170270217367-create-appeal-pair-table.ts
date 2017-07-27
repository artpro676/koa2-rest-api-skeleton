'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('appeal_pair', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            appealId1: {
                type: Sequelize.INTEGER,
            },
            appealId2: {
                type: Sequelize.INTEGER,
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
        await queryInterface.dropTable('appeal_pair');
    }
};