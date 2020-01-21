const Discord = require('discord.js');
const mysql = require('mysql');
const auth = require('../auth.json');
const config = require('../config/bot-config.json');
const jobs = require('./jobs');
const db = require('./db');

const client = new Discord.Client();
const CHECK_PERIOD = 60000;
//const database = new db.MockDatabase(null);
const database = new db.Database(mysql.createConnection(require('../config/mysql-config.json')));

const jobsToRun = [
    new jobs.SignUpChaser(config.signups, client, database),
    new jobs.DonateChaser(config.donations, client, database)
];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.setInterval(() => {
        jobsToRun.forEach((job) => {
            //job.processJob(); //TODO: onInterval
        });

        //keep connection alive, I'm sure you are not supposed to do this lol but oh well
        if (database.connection) {
            database.connection.query("SELECT 1", () => {});
        }
    }, CHECK_PERIOD);
});

client.on('message', msg => {
    if (msg.author.id == config.main.admin) {
        if (msg.content === '!syncRaiders') {
            let job = new jobs.RoleUpdater(config.main, client, database);

            job.syncRoles();
        } else {
            let found = msg.content.match(/\!comment[\s]*(.*)/);

            if (found) {
                let message = found[1];
                let channel = client.channels.get(config.main.channel);

                channel.send(message);
            }
        }
    }
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
    let oldRoles = oldMember.roles;
    let newRoles = newMember.roles;

    if (oldRoles.has(config.main.raiderRole) && !newRoles.has(config.main.raiderRole)) { //demotion!
        (new jobs.RoleUpdater(config.main, client, database)).handleRoleRemoval(newMember);
    } else if (!oldRoles.has(config.main.raiderRole) && newRoles.has(config.main.raiderRole)) { //promotion!
        (new jobs.RoleUpdater(config.main, client, database)).handleRoleAdd(newMember);
    }
});

client.on('error', (error) => {
    console.log(error.name);
    console.log(error.message);
});

client.login(auth.token);
