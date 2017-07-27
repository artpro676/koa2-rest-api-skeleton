'use strict';

import models from '../models';
import * as _ from 'lodash';

module.exports = {
    up: async function (queryInterface, Sequelize) {
        const beams = await models.Beam.findAll({where: models.sequelize.literal('array_length("beam"."tags", 1) > 0')});

        for(var i in beams){
            const beam = beams[i];
            beam.tags = _.map(beam.tags, (tag:any) => {
                if(tag[0] == '#'){return _.toLower(tag.substring(1))}
                return _.toLower(tag);
            });

            console.log(beam.tags);

            await beam.save();
        }
    },
    down: async function (queryInterface, Sequelize) {}
};