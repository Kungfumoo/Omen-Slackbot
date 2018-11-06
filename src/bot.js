const Discord = require('discord.js');
const auth = require('../auth.json');
const config = require('../config/bot-config.json');
const jobs = require('./jobs');
const db = require('./db');

const client = new Discord.Client();
const CHECK_PERIOD = 5000;//3.6e6;
const database = new db.MockDatabase(null);
const jobsToRun = [
    new jobs.SignUpChaser(config.signups, client, database),
    new jobs.DonateChaser(config.donations, client, database)
];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.setInterval(() => {
        jobsToRun.forEach(function(job) {
            job.processJob(); //TODO: onInterval
        });
    }, CHECK_PERIOD);
});

client.on('message', msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }

    //todo: PM command to update raider roster db
});

client.login(auth.token);
