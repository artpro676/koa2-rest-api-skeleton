'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam_share', 'provider');

        await queryInterface.addColumn('beam_share', 'instagram', {type: Sequelize.BOOLEAN});
        await queryInterface.addColumn('beam_share', 'facebook', {type: Sequelize.BOOLEAN});
        await queryInterface.addColumn('beam_share', 'twitter', {type: Sequelize.BOOLEAN});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam_share', 'instagram', {type: Sequelize.BOOLEAN});
        await queryInterface.removeColumn('beam_share', 'facebook', {type: Sequelize.BOOLEAN});
        await queryInterface.removeColumn('beam_share', 'twitter', {type: Sequelize.BOOLEAN});

        await queryInterface.addColumn('beam_share', 'provider', {type: Sequelize.STRING});
    }
};