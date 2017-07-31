'use strict';

module.exports = {
    up: async function(queryInterface, Sequelize) {

        await queryInterface.createTable('email_black_list', {
            email: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            reasonType: {
                type: Sequelize.STRING
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            }
        });

        return queryInterface.addIndex('email_black_list', ['email'], {
            indexName: 'email_blacklist_email_unique_index',
            indicesType: 'UNIQUE'
        });
    },
    down: async function(queryInterface, Sequelize) {
        await queryInterface.removeIndex('email_black_list', 'email_blacklist_email_unique_index');
        return queryInterface.dropTable('email_black_list');
    }
};