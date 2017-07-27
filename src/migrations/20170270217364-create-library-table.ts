'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('library', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            categoryId: {
                type: Sequelize.INTEGER,
            },
            title: {
                type: Sequelize.STRING,
            },
            description: {
                type: Sequelize.TEXT,
            },
            type: {
                type: Sequelize.STRING,
            },
            bigPictureUrl: {
                type: Sequelize.STRING,
            },
            smallPictureUrl: {
                type: Sequelize.STRING,
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
        await queryInterface.dropTable('library');
    }
};