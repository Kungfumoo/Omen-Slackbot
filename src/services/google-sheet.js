'use strict';

const moment = require("moment");
const GoogleSpreadsheet = require('google-spreadsheet');

//Taken from https://github.com/bleasdal3/SLM-Sign-Bot, Thanks Nick!
class GoogleSheet {
    constructor(sheetId, auth) {
        this.sheet = new GoogleSpreadsheet(sheetId);
        this.sheet.useServiceAccountAuth(auth);
    }

    UpdateSignup(eventDate, playerID, signValue) {
        const sheet = this.sheet;
        eventDate = moment(eventDate);

        //get rows
        sheet.getRows({
            limit: 35
        }, function (err, rows) {
            //search rows
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].id == playerID) { //found ID in rows
                    let key = eventDate.format("dddDDMMM").toLowerCase();

                    if (!rows[key]) {
                        break; //TODO notify me? no date found to apply
                    }

                    if (signValue == 1) {
                        rows[key] = "A";
                    } else {
                        rows[key] = "N";
                    }

                    rows.save();
                    break;
                }
            }

            //TODO: if it gets here then nothing was found, need slackbot to notify me
        });
    }

    AddRaider() {

    }

    RemoveRaider() {

    }

    AddEventColumn() {

    }
}

module.exports = GoogleSheet;