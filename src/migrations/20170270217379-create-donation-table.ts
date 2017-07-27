'use strict';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('donation', 'type', {type: Sequelize.STRING});
        await queryInterface.addColumn('donation', 'transactionId', {type: Sequelize.STRING});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('donation', 'type');
        await queryInterface.removeColumn('donation', 'transactionId');
    }
};