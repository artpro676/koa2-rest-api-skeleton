'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('user_auth', 'authType', {type: Sequelize.STRING});
        await queryInterface.addColumn('beam', 'donationProjectId', {type: Sequelize.INTEGER});
        await queryInterface.addColumn('beam', 'donationProjectType', {type: Sequelize.STRING});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('user_auth', 'authType');
        await queryInterface.removeColumn('beam', 'donationProjectId');
        await queryInterface.removeColumn('beam', 'donationProjectType');
    }
};