'use strict';

const Job = require("./job.js");

class BenchUpdater extends Job {
    constructor(config, discord, database, googleSheet) {
        super(config, discord, database);

        this.sheet = googleSheet;
    }

    onInterval() {
        /*let date = new Date();
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

        this.processJob();*/
    }

    processJob() {
        if (this.processed) {
            return;
        }

        let eventDates = this._fetchEventDates();

        eventDates.forEach((eventDate) => {
            let benched = await this.sheet.findBenchedUsers(eventDate);
            let names = await this.database.fetchNamesById(benched); //resolve ids to names

            names.forEach((name) => {
                this.database.addBenchedUser(name, eventDate);
            });

            this.processed = new Date();
        });
    }

    _fetchEventDates() {
        let weekdays = this.config.eventDays;
        let eventDates = [];

        weekdays.forEach((date) => {
            let today = moment();
            today.add((7 - today.day()) + date, 'days');

            eventDates.push(today);
        });

        return eventDates;
    }
}

module.exports = BenchUpdater;