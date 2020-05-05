'use strict';

class Job {
    constructor(config, discord, database) {
        this.config = config;
        this.discord = discord;
        this.database = database;
    }

    onInit() {}

    onInterval() {}

    processJob() {}
}

module.exports = Job;
