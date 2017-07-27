'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('saved_beam', 'postId', {type: Sequelize.INTEGER, allowNull: true});
        await queryInterface.changeColumn('saved_beam', 'beamId', {type: Sequelize.INTEGER, allowNull: true});
        await queryInterface.renameTable('saved_beam', 'saved_content');
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.renameTable('saved_content', 'saved_beam');
        await queryInterface.removeColumn('saved_beam', 'postId');
    }
};