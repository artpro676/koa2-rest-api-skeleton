'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {

        return queryInterface.addIndex(
            'user',
            ['email'],
            {
                indexName: 'user_email_index',
                indicesType: 'UNIQUE'
            }
        );
    },
    down: function (queryInterface, Sequelize) {
        return queryInterface.removeIndex('user', 'user_email_index');
    }
};