'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {

        await queryInterface.addColumn('user', 'pictureName', {
            type: Sequelize.STRING
        });

        await queryInterface.addColumn('beam', 'imageName', {
            type: Sequelize.STRING
        });
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('user', 'pictureName');
        await queryInterface.removeColumn('beam', 'imageName');
    }
};