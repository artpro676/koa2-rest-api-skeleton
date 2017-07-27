'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('comment', 'postId', {type: Sequelize.INTEGER, allowNull: true});
        await queryInterface.changeColumn('comment', 'beamId', {type: Sequelize.INTEGER, allowNull: true});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('comment', 'postId');
    }
};