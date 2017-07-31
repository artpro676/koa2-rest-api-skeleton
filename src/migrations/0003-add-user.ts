'use strict';

import models from '../models';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return models.User.bulkCreate([{
            id: 1,
            first_name: "John",
            last_name: "Doe",
            email: "jd@dummy.com",
            dob: "2017-02-22 18:57:39",
            gender: "male",
            password: "test123",
            bio: "Here is my description..."
        }, {
            id: 2,
            first_name: "Admin",
            last_name: "Super",
            role: "super",
            email: "admin@beamauthentic.com",
            dob: "2000-01-21 11:11:39",
            gender: "male",
            password: "ADMIN2017",
            bio: "Here is my description..."
        }], {individualHooks : true})

    },
    down: function(queryInterface, Sequelize) {}
};