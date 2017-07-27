'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('post_black_list', {
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
                type: Sequelize.INTEGER,
            },
            isFlagged: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            description: {
                type: Sequelize.TEXT,
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
        await queryInterface.dropTable('post_black_list');
    }
};


