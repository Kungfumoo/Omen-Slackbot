'use strict';

var Database = require("./database.js");

class MockDatabase extends Database
{
    fetchUnSignedRaiders() {
        return new Promise((resolve, reject) => {
            resolve([
                "230604196490117120", //kfm
                "230102238306107392" //tym
            ]);
        });
    }

    fetchRequiredDonaters() {
        return new Promise((resolve, reject) => {
            resolve({
                "230604196490117120": 2, //kfm
                "230102238306107392": 42 //tym
            });
        });
    }
}

module.exports = MockDatabase;
