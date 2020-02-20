'use strict';

const Job = require("./job.js");

class BenchUpdater extends Job {
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

        //TODO: Scan google sheet and updated benched people table
    }
}

module.exports = BenchUpdater;