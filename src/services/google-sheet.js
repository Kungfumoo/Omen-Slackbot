'use strict';

const moment = require("moment");
const GoogleSpreadsheet = require('google-spreadsheet');

//Taken from https://github.com/bleasdal3/SLM-Sign-Bot, Thanks Nick!
class GoogleSheet {
    constructor(sheetId, auth) {
        this.sheet = new GoogleSpreadsheet(sheetId);
        this.ready = false;
        this.sheet.useServiceAccountAuth(auth, () => {
            this.ready = true;
        });
    }

    UpdateSignup(eventDate, playerID, signValue) {
        if (!this.ready) {
            console.log("Spreadsheet not ready!")
            return;
        }

        const sheet = this.sheet;
        eventDate = moment(eventDate);

        //get rows
        sheet.getRows(1, {
            limit: 35
        }, function (err, rows) {
            if (err) {
                console.log(err);
            }

            //search rows
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i];
                if (row.id == playerID) { //found ID in rows
                    let key = eventDate.format("dddDDMMM").toLowerCase();

                    if (typeof row[key] == "undefined") {
                        console.log(key + " cound not be found in the sheet headers");
                        return;
                    }

                    if (signValue == 1) {
                        row[key] = "A";
                    } else {
                        row[key] = "N";
                    }

                    row.save();
                    return;
                }
            }

            //TODO: if it gets here then nothing was found, need slackbot to notify me
            console.log(playerID + " could not be found in the spreadsheet!");
        });
    }

    AddRaider() {
        if (!this.ready) {
            console.log("Spreadsheet not ready!")
            return;
        }
    }

    RemoveRaider() {
        if (!this.ready) {
            console.log("Spreadsheet not ready!")
            return;
        }
    }

    AddEventColumn() {
        if (!this.ready) {
            console.log("Spreadsheet not ready!")
            return;
        }
    }
}

module.exports = GoogleSheet;