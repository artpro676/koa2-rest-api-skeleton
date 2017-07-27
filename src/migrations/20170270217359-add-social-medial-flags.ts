'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('beam', 'isFacebook', {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });
        await queryInterface.addColumn('beam', 'isInstagram', {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });
        await queryInterface.addColumn('beam', 'isTwitter', {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('beam', 'isFacebook');
        await queryInterface.removeColumn('beam', 'isInstagram');
        await queryInterface.removeColumn('beam', 'isTwitter');
    }
};