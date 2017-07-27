'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam', 'imageFormat', {type: Sequelize.STRING});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam', 'imageFormat');
    }
};