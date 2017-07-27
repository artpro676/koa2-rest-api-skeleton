'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('user', 'username', {type: Sequelize.STRING});
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('user', 'username');
    }
};