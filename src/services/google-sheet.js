'use strict';

const moment = require("moment");
const GoogleSpreadsheet = require('google-spreadsheet');
const { series, timesSeries, queue } = require('async');

const WORKSHEET_ID = 1;

//Taken from https://github.com/bleasdal3/SLM-Sign-Bot, Thanks Nick!
class GoogleSheet {
    constructor(sheetId, auth) {
        this.sheet = new GoogleSpreadsheet(sheetId);
        this.ready = false;
        this.sheet.useServiceAccountAuth(auth, () => {
            this.ready = true;
        });
        this.updateQueue = queue(
            (task, callback) => {
                task(callback);
            }
        )
    }

    UpdateSignup(eventDate, playerID, signValue) {
        if (!this.ready) {
            console.log("Spreadsheet not ready!")
            return;
        }

        eventDate = moment(eventDate);

        this.updateQueue.push((step) => {
            //search rows
            this._findRaiderRow(playerID).then((row) => {
                if (!row) {
                    //TODO: nothing was found, need slackbot to notify me
                    console.log(playerID + " could not be found in the spreadsheet!");
                    step();
                    return;
                }

                let key = eventDate.format("dddDDMMM").toLowerCase();

                if (typeof row[key] == "undefined") {
                    console.log(key + " cound not be found in the sheet headers");
                    step();
                    return;
                }

                if (signValue == 1) {
                    row[key] = "A";
                } else {
                    row[key] = "N";
                }

                row.save(step);
                return;
            });
        });
    }

    AddRaider(id, name, cb) {
        if (!this.ready) {
            console.log("Spreadsheet not ready!")
            return;
        }

        this._findRaiderRow(id).then((row) => {
            if (row) {
                return; //already added
            }

            this.sheet.addRow(WORKSHEET_ID, {
                "name": name,
                "discordid": id
            }, (err) => {
                if (err) {
                    console.log("Add Row Error: " + err);
                    return;
                }

                if (cb) {
                    cb();
                }
            });
        });
    }

    RemoveRaider(id, cb) {
        if (!this.ready) {
            console.log("Spreadsheet not ready!")
            return;
        }

        this._findRaiderRow(id).then((row) => {
            if (!row) {
                return; //already removed
            }

            row.del(() => {
                if (cb) {
                    cb();
                }
            });
        });
    }

    AddEventColumn(eventDate) {
        if (!this.ready) {
            console.log("Spreadsheet not ready!")
            return;
        }

        //TODO: currently being handled by a spreadsheet script.
    }

    BulkUpdateUsers(addedUsers, removedUsers) {
        series([
            () => {
                timesSeries(
                    addedUsers.length,
                    (n, next) => {
                        this.AddRaider(
                            addedUsers[n].id,
                            addedUsers[n].name,
                            next()
                        );
                    }
                )
            },
            () => {
                timesSeries(
                    removedUsers.length,
                    (n, next) => {
                        this.RemoveRaider(
                            removedUsers[n].id,
                            next()
                        );
                    }
                )
            }
        ]);
    }

    findBenchedUsers(eventDate) {
        let key = eventDate.format("dddDDMMM").toLowerCase();

        return new Promise((resolve) => {
            let benched = [];

            sheet.getRows(WORKSHEET_ID, {
                limit: 35
            }, function (err, rows) {
                if (err) {
                    console.log(err);
                    resolve([]);
                    return;
                }

                //search rows
                for (let i = 0; i < rows.length; i++) {
                    let row = rows[i];

                    if (typeof row[key] == "undefined") {
                        resolve([]);
                        return;
                    }

                    if (row[key].toUpperCase() == 'S') {
                        benched.push(row.discordid)
                    }
                }

                resolve(benched);
            });
        });
    }

    _findRaiderRow(playerID) {
        const sheet = this.sheet;

        return new Promise((resolve) => {
            //get rows
            sheet.getRows(WORKSHEET_ID, {
                limit: 35
            }, function (err, rows) {
                if (err) {
                    console.log(err);
                }

                //search rows
                for (let i = 0; i < rows.length; i++) {
                    let row = rows[i];

                    if (row.discordid == playerID) { //found ID in rows
                        resolve(row);
                        return;
                    }
                }

                //none found
                resolve(null);
            });
        });
    }
}

module.exports = GoogleSheet;