'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.createTable('beam_share', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
            },
            beamId: {
                type: Sequelize.INTEGER,
            },
            provider: {
                type: Sequelize.STRING,
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        });

        await queryInterface.removeColumn('beam', 'isInstagram');
        await queryInterface.removeColumn('beam', 'isFacebook');
        await queryInterface.removeColumn('beam', 'isTwitter');
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.dropTable('beam_share');

        await queryInterface.addColumn('beam', 'isInstagram', {type: Sequelize.STRING});
        await queryInterface.addColumn('beam', 'isFacebook', {type: Sequelize.STRING});
        await queryInterface.addColumn('beam', 'isTwitter', {type: Sequelize.STRING});
    }
};