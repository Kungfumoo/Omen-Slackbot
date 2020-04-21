'use strict';

const moment = require("moment");

class Database {
    constructor(connection) {
        this.connection = connection;

        if (connection) {
            connection.connect();
        }
    }

    fetchAllUsers() {
        return new Promise((resolve, reject) => {
            let users = [];

            this.connection.query(
                "SELECT u.id FROM discordUsers AS u",
                (error, results, fields) => {
                    results.forEach((result) => {
                        users.push(result.id);
                    });

                    resolve(users);
                }
            );
        });
    }

    fetchNamesById(discordIds) {
        return new Promise((resolve, reject) => {
            let query = this.connection.format(
                "SELECT u.name FROM discordUsers AS u WHERE u.id IN (?)",
                [discordIds]
            );
            let users = [];

            this.connection.query(
                query,
                (error, results, fields) => {
                    results.forEach((result) => {
                        users.push(result.name);
                    });

                    resolve(users);
                }
            );
        });
    }

    fetchUnSignedRaiders(eventDate) {
        eventDate = moment(eventDate).format("Y-M-D");

        return new Promise((resolve, reject) => {
            let users = [];
            let query = this.connection.format(
                "SELECT u.id FROM discordUsers AS u WHERE u.id NOT IN " +
                "(SELECT s.playerId FROM signs AS s WHERE s.signDate = ?)",
                [eventDate]
            );

            this.connection.query(
                query,
                (error, results, fields) => {
                    if (results) {
                        results.forEach((result) => {
                            users.push(result.id);
                        });
                    }

                    resolve(users);
                }
            );
        });
    }

    fetchRequiredDonaters() {
        return new Promise((resolve, reject) => {
            let users = {};

            this.connection.query(
                "SELECT u.id, s.missing FROM discordUsers AS u " +
                "INNER JOIN missingDonations AS s ON u.name = s.name " +
                "WHERE u.recruit = 0",
                (error, results, fields) => {
                    if (results.length == 0) {
                        resolve(null);
                        return;
                    }

                    results.forEach((result) => {
                        users[result.id] = result.missing;
                    });

                    resolve(users);
                }
            );
        });
    }

    addSignUp(userId, eventDate) {
        eventDate = moment(eventDate).format("Y-M-D");

        return new Promise((resolve, reject) => {
            //Check existing records, if no sign up then insert new sign up, if it exists then change attending to 1
            let query = this.connection.format(
                "SELECT COUNT(*) as count FROM signs WHERE playerId = ? AND signDate = ?",
                [userId, eventDate]
            );

            this.connection.query(
                query,
                (error, results, fields) => {
                    let count = results[0].count;

                    if (count) { //update record
                        this.connection.query(
                            this.connection.format(
                                "UPDATE signs SET attending = 1 WHERE playerId = ? AND signDate = ?",
                                [userId, eventDate]
                            )
                        );

                        resolve();
                        return;
                    }

                    //insert record
                    this.connection.query(
                        this.connection.format(
                            "INSERT INTO signs VALUES (?, ?, 1)",
                            [eventDate, userId]
                        )
                    );

                    resolve();
                }
            )
        });
    }

    addUnSign(userId, eventDate) {
        eventDate = moment(eventDate).format("Y-M-D");

        return new Promise((resolve, reject) => {
            //Check existing records, if no sign up then insert new sign up, if it exists then change attending to 0
            let query = this.connection.format(
                "SELECT COUNT(*) as count FROM signs WHERE playerId = ? AND signDate = ?",
                [userId, eventDate]
            );

            this.connection.query(
                query,
                (error, results, fields) => {
                    let count = results[0].count;

                    if (count) { //update record
                        this.connection.query(
                            this.connection.format(
                                "UPDATE signs SET attending = 0 WHERE playerId = ? AND signDate = ?",
                                [userId, eventDate]
                            )
                        );

                        resolve();
                        return;
                    }

                    //insert record
                    this.connection.query(
                        this.connection.format(
                            "INSERT INTO signs VALUES (?, ?, 0)",
                            [eventDate, userId]
                        )
                    );

                    resolve();
                }
            )
        });
    }

    removeUser(userId) {
        return new Promise((resolve, reject) => {
            let query = this.connection.format(
                "DELETE FROM discordUsers WHERE id = ?",
                [userId]
            );

            this.connection.query(
                query,
                (error, results, fields) => {
                    resolve();
                }
            );
        });
    }

    addUser(userId, name) {
        return new Promise((resolve, reject) => {
            let query = this.connection.format(
                "INSERT INTO discordUsers VALUES (?, ?, 0)",
                [userId, name]
            );

            this.connection.query(
                query,
                (error, results, fields) => {
                    resolve();
                }
            );
        });
    }

    addBenchedUser(name, eventDate) {
        eventDate = moment(eventDate).format("Y-M-D");

        return new Promise((resolve, reject) => {
            let query = this.connection.format(
                "INSERT INTO bench VALUES (?, ?)",
                [eventDate, name]
            );

            this.connection.query(
                query,
                (error, results, fields) => {
                    resolve();
                }
            );
        });
    }
}

module.exports = Database;
