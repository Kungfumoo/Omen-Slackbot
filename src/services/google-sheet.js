'use strict';

const moment = require("moment");

//Taken from https://github.com/bleasdal3/SLM-Sign-Bot, Thanks Nick!
class GoogleSheet {
    constructor(config) {
        //TODO: set up this.sheet
    }

    UpdateSignup(eventDate, playerID, signValue) {
        const sheet = this.sheet;
        eventDate = moment(eventDate);

        //get rows
        sheet.getRows({
            limit: 35
        }, function (err, rows) {
            let signDate = eventDate.format("ddd DD MMM");

            //search rows
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].id == playerID) { //found ID in rows
                    let keyArray = Object.keys(rows[i]);

                    for (let x = 0; x < (Object.keys(rows[i])).length; x++) {
                        if (keyArray[x] == signDate) { //find date in row
                            foundX = x; //the for loop keeps iterating as getCells is async.

                            sheet.getCells({
                                'min-row': (i + 2), //the indexes are strange
                                'max-row': (i + 2),
                                'return-empty': true
                            }, function (err, cells) {
                                let cell = cells[foundX - 3]; //x = 9 but col num is 6? and recorded as 7?

                                if (!cell.value.toLowerCase() == 'c') {
                                    cell.value = signValue;
                                    cell.save(function (err) {
                                        //TODO: report error?
                                    });
                                }

                            });

                            return;
                        }
                    }

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