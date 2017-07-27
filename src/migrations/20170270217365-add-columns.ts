'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('user', 'authId', {type: Sequelize.STRING});
        await queryInterface.addColumn('user', 'companyName', {type: Sequelize.STRING});
        await queryInterface.addColumn('beam', 'properties', {type: Sequelize.JSON});
        await queryInterface.addColumn('appeal', 'tags', {type: Sequelize.ARRAY(Sequelize.STRING)});
        await queryInterface.addColumn('interest', 'tags', {type: Sequelize.ARRAY(Sequelize.STRING)});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('user', 'authId');
        await queryInterface.removeColumn('user', 'companyName');
        await queryInterface.removeColumn('beam', 'properties');
        await queryInterface.removeColumn('appeal', 'tags');
        await queryInterface.removeColumn('interest', 'tags');
    }
};