'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {

        const contents = await models.ContentKey.findAll({
            include: [
                {model: models.Beam, as: 'beam'},
                {model: models.Post, as: 'post'}
            ]
        });

        for(let i in contents){
            if(contents[i].beam === null && contents[i].post === null){
                console.log(contents[i].toJSON());
                await contents[i].destroy();
            }
        }
    },
    down: async function (queryInterface, Sequelize) {
    }
};