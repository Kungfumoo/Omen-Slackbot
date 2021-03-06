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

    fetchNamesById(discordIds) {
        return new Promise((resolve, reject) => {
            resolve([
                "kungfumoo",
                "tymia"
            ]);
        });
    }

    fetchUnSignedRaiders(eventDate) {
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

    addBenchedUsers(users) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    addEvent(messageId, eventDate, expireDate) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    fetchLiveEvents() {
        return new Promise((resolve, reject) => {
            resolve([
                {
                    'messageId': "23160419642921720",
                    'eventDate': "",
                    'expireDate': ""
                },
                {
                    'messageId': "32160419142921720",
                    'eventDate': "",
                    'expireDate': ""
                }
            ]);
        });
    }
}

module.exports = MockDatabase;
