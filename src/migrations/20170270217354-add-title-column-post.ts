'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('post', 'title', {type: Sequelize.STRING});
        await queryInterface.addColumn('post', 'linkUrl', {type: Sequelize.STRING});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('post', 'title');
        await queryInterface.removeColumn('post', 'linkUrl');
    }
};