'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {

        await queryInterface.createTable('interest', {
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

        await queryInterface.addIndex('interest', ['name'], {
            indexName: 'beam_interest_unique_index',
            indicesType: 'UNIQUE'
        });

        await queryInterface.addColumn('user', 'interestId', {type: Sequelize.ARRAY(Sequelize.INTEGER)});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('user', 'interestId');

        await queryInterface.removeIndex('interest', 'beam_interest_unique_index');
        await queryInterface.dropTable('interest');
    }
};