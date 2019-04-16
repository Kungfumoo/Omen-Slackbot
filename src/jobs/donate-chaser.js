'use strict';

var Job = require("./job.js");

const FLASKS_PER_WEEK = 3;

class DonateChaser extends Job {
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

        let promise = this.database.fetchRequiredDonaters();

        promise.then((raiders) => {
            if (!raiders) {
                return;
            }

            let channel = this.discord.channels.get(this.config.channel);

            if (!channel) {
                console.log("No channel found, unable to execute this job");
                return;
            }

            let mentions = '';

            for (let user in raiders) {
                mentions += ' <@' + user + '> (flasks needed: ' + (raiders[user] * FLASKS_PER_WEEK) + ')';
            }

            channel.send("Missing donations from:" + mentions);
            channel.send("Oh...and Tom's anus looks like a punched lasagna.");
            this.processed = new Date();
        });
    }
}

module.exports = DonateChaser;
