'use strict';

var Database = require("./database.js");

class MockDatabase extends Database
{
    fetchAllUsers() {
        return new Promise((resolve, reject) => {
            resolve([
                "230604196490117120", //kfm
                "230102238306107392" //tym
            ]);
        });
    }

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

    addSignUp(userId, eventDate) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    addUnSign(userId, eventDate) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    removeUser(userId) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    addUser(userId, name) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
}

module.exports = MockDatabase;
