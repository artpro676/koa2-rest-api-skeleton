'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {

        const types = models.Event.types;
        const events = await models.Event.findAll({where: {type: {$in : ['content_comment', 'content_like']}}});

        for(var i in events){
            const event = events[i];

            switch (true){
                case event.title.indexOf("liked beam") > 0 :
                    event.type = types.BEAM_LIKE;
                    break;
                case event.title.indexOf("liked post") > 0 :
                    event.type = types.POST_LIKE;
                    break;
                case event.title.indexOf("commented beam") > 0 :
                    event.type = types.BEAM_COMMENT;
                    break;
                case event.title.indexOf("commented post") > 0 :
                    event.type = types.POST_COMMENT;
                    break;
            }

            await event.save();
        }
    },
    down: async function (queryInterface, Sequelize) {}
};