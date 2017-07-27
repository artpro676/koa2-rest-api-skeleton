'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {

        await queryInterface.createTable('category', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
            },
            description: {
                type: Sequelize.STRING,
            },
            imageURL: {
                type: Sequelize.STRING,
            },
            rectangleImageURL: {
                type: Sequelize.STRING,
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('category', ['name'], {
            indexName: 'beam_category_unique_index',
            indicesType: 'UNIQUE'
        });

        await queryInterface.addColumn('user', 'categoryId', {type: Sequelize.ARRAY(Sequelize.INTEGER)});
        await queryInterface.addColumn('beam', 'categoryId', {type: Sequelize.ARRAY(Sequelize.INTEGER)});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('user', 'categoryId');
        await queryInterface.removeColumn('beam', 'categoryId');

        await queryInterface.removeIndex('category', 'beam_category_unique_index');
        await queryInterface.dropTable('category');
    }
};