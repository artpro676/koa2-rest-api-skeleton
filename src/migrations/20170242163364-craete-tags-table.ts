'use strict';

module.exports = {
    up: async function(queryInterface, Sequelize) {
        await queryInterface.createTable('tag', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            value: {
                type: Sequelize.STRING
            },
            counter: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('tag', ['value'], {
            indexName: 'tag_unique_index',
            indicesType: 'UNIQUE'
        });
    },
    down: async function(queryInterface, Sequelize) {
        await queryInterface.removeIndex('tag', 'tag_unique_index');
        await queryInterface.dropTable('tag');
    }
};