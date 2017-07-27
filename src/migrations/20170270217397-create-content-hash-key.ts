'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('content_link_hash', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
            },
            postId: {
                allowNull: true,
                type: Sequelize.INTEGER,
            },
            beamId: {
                allowNull: true,
                type: Sequelize.INTEGER,
            },
            hash: {
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
        await queryInterface.dropTable('content_link_hash');
    }
};