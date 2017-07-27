'use strict';

import models from '../models';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        await queryInterface.addColumn('user', 'appealId', {type: Sequelize.ARRAY(Sequelize.INTEGER)});
    },
    down: async function (queryInterface, Sequelize) {
        await queryInterface.removeColumn('user', 'appealId');
    }
};