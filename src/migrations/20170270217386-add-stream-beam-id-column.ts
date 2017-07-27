'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam_device', 'streamedPostId', {type: Sequelize.INTEGER});
        await queryInterface.addColumn('beam_device', 'streamedBeamId', {type: Sequelize.INTEGER});
        await queryInterface.removeColumn('beam_device', 'streamedId');
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam_device', 'streamedPostId');
        await queryInterface.removeColumn('beam_device', 'streamedBeamId');
        await queryInterface.addColumn('beam_device', 'streamedId', {type: Sequelize.INTEGER});
    }
};