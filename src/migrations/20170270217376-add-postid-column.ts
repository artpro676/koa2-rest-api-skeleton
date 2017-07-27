'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam_device', 'postId', {type: Sequelize.ARRAY(Sequelize.INTEGER)});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam_device', 'postId');
    }
};