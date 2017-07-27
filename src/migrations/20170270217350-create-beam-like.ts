'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {

        await queryInterface.createTable('beam_like', {
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
            beamId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            isLike: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('beam_like', ['userId', 'beamId'], {
            indexName: 'beam_like_unique_index',
            indicesType: 'UNIQUE'
        });
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeIndex('beam_like', 'beam_like_unique_index');
        await queryInterface.dropTable('beam_like');
    }
};