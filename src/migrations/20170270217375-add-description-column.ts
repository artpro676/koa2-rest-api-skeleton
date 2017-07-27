'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam_black_list', 'description', {type: Sequelize.TEXT});
        await queryInterface.addColumn('user_black_list', 'description', {type: Sequelize.TEXT});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam_black_list', 'description');
        await queryInterface.removeColumn('user_black_list', 'description');
    }
};