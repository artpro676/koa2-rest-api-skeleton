'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.renameTable('beam_like', 'content_like');
        await queryInterface.addColumn('content_like', 'postId', {type: Sequelize.INTEGER, allowNull: true});
        await queryInterface.changeColumn('content_like', 'beamId', {type: Sequelize.INTEGER, allowNull: true});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('content_like', 'postId');
        await queryInterface.renameTable('content_like', 'beam_like');
    }
};