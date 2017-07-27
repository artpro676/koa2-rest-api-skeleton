'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {

        return queryInterface.addColumn('user', 'gender', {
            type: Sequelize.STRING
        });
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.removeColumn('user', 'gender');
    }
};