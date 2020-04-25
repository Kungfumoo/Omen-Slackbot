'use strict';

const moment = require("moment");
const Job = require("./job.js");

class BenchUpdater extends Job {
    constructor(config, discord, database, googleSheet) {
        super(config, discord, database);

        this.sheet = googleSheet;
    }

    onInterval() {
        let date = new Date();
        let dow = date.getDay();
        let hour = date.getHours();

        //reset process counter
        if (this.processed && this.processed.getDay() != dow) {
            this.processed = false;
        }

        if (this.config.interval.weekdays.indexOf(dow) == -1 ||
            hour != this.config.interval.hour) {
            return;
        }

        this.processJob();
    }

    processJob() {
        if (this.processed) {
            return;
        }

        //find benched people for today
        let eventDate = moment();

        this.processBenched(eventDate);
        this.processed = new Date();
    }

    async processBenched(eventDate) {
        let benched = await this.sheet.findBenchedUsers(eventDate);
        let names = await this.database.fetchNamesById(benched); //resolve ids to names

        names.forEach((name) => {
            this.database.addBenchedUser(name, eventDate);
        });
    }
}

module.exports = BenchUpdater;