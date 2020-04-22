const Discord = require('discord.js');
const mysql = require('mysql');
const auth = require('../auth.json');
const config = require('../config/bot-config.json');
const jobs = require('./jobs');
const db = require('./db');
const GoogleSheet = require('./services/google-sheet.js');

const client = new Discord.Client();
const CHECK_PERIOD = 60000;
//const database = new db.MockDatabase(null);
const database = new db.Database(mysql.createConnection(require('../config/mysql-config.json')));
const sheetService = new GoogleSheet(
    config.googleSheet.sheetId,
    require('../google-auth.json')
);
const roleUpdater = new jobs.RoleUpdater(
    config.main,
    client,
    database,
    sheetService
);
const jobsToRun = [
    new jobs.SignUpChaser(config.signups, client, database),
    new jobs.DonateChaser(config.donations, client, database),
    new jobs.RaidEventHandler(config.raidEvents, client, database, sheetService),
    new jobs.BenchUpdater(config.benchUpdater, client, database, sheetService)
];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    client.setInterval(() => {
        jobsToRun.forEach((job) => {
            job.onInterval(); //job.processJob();
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
            roleUpdater.syncRoles();
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
        roleUpdater.handleRoleRemoval(newMember);
    } else if (!oldRoles.has(config.main.raiderRole) && newRoles.has(config.main.raiderRole)) { //promotion!
        roleUpdater.handleRoleAdd(newMember);
    }
});

client.on('error', (error) => {
    console.log(error.name);
    console.log(error.message);
});

client.login(auth.token);
