'use strict';

module.exports = {
    up: async function(queryInterface, Sequelize) {
         await queryInterface.createTable('stream', {
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
            planId: {
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING
            },
            description: {
                type: Sequelize.TEXT
            },
            type: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.STRING
            },
            visibility: {
                type: Sequelize.STRING
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

        return queryInterface.addIndex(
            'stream',
            ['planId', 'userId', 'title'],
            {
                indexName: 'stream_unique_index',
                indicesType: 'UNIQUE'
            }
        );
    },
    down: async function(queryInterface, Sequelize) {
        await queryInterface.removeIndex('stream', 'stream_unique_index');
        return queryInterface.dropTable('stream');
    }
};