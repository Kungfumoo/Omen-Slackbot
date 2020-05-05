'use strict';

const { RichEmbed } = require('discord.js');
const moment = require("moment");
const Job = require("./job.js");
const TICK_EMOJI = '✅';
const CROSS_EMOJI = '❌';
const COLLECTOR_LISTEN_TIME = 6.048e+8;
const NOTIFY_DELAY = 60000;

class RaidEventHandler extends Job {
    constructor(config, discord, database, googleSheet) {
        super(config, discord, database);

        this.sheet = googleSheet;
        this.initCollectors();
    }

    async initCollectors() {
        //grab last three messages from db, check if they are expired, if they are not then re-initilise for the time till expiry.
        //grab last message ids
        let currentEvents = await this.database.fetchLiveEvents();

        //re-initalise collectors
        let channel = this.discord.channels.get(this.config.channel);

        currentEvents.forEach(event => {
            let message = channel.messages.resolve(event.messageId);

            //this._setupCollector(message, eventDate);
        });
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

        let channel = this.discord.channels.get(this.config.channel);

        //Publish new events
        this._publishEvent(channel);

        this.processed = new Date();
    }

    handleSign(user, eventDate) {
        let promise = this.database.addSignUp(user.id, eventDate);

        promise.then(() => {
            //any post sign up work
            this.sheet.UpdateSignup(eventDate, user.id, 1);
        });
    }

    handleUnsign(user, eventDate) {
        let promise = this.database.addUnSign(user.id, eventDate);

        promise.then(() => {
            //any post unsign work
            this.sheet.UpdateSignup(eventDate, user.id, 0);
        });
    }

    //Recursive utilizing the promise to ensure they are posted in order and serialy
    _publishEvent(channel, eventIndex = 0) {
        let date = this.config.eventDays[eventIndex];

        if (typeof date == "undefined") { //no more events to publish
            this._notifyEventsReady();
            return;
        }

        let today = moment();
        today.add((7 - today.day()) + date, 'days');

        const embed = this._createEventRichEmbed(today);

        channel.send(embed)
               .then((message) => {
                   this.database.addEvent(
                       message.id,
                       today,
                       today.add(COLLECTOR_LISTEN_TIME, 'milliseconds')
                   );
                   this._handleEventMessage(message, today);
                   this._publishEvent(channel, eventIndex + 1);
               })
               .catch(console.error);
    }

    _createEventRichEmbed(date) {
        let eventMeta = this.config.eventMeta;

        return new RichEmbed()
            .setAuthor("Emerald Omen", eventMeta.iconUrl)
            .setTitle(eventMeta.title)
            .setColor(0xFF0000)
            .addField("Date", date.format("dddd, MMMM Do YYYY"))
            .setFooter(eventMeta.description);
    }

    _handleEventMessage(message, eventDate) {
        //Bot does initial reactions so people can just click
        message.react(TICK_EMOJI)
               .then(() => {
                   message.react(CROSS_EMOJI);
               }); //exploiting the promise to format the reactions in the right order

        this._setupCollector(message, eventDate);
    }

    _setupCollector(message, eventDate) {
        //cache signups and unsign ids
        message.signUps = [];
        message.unsigns = [];

        //set up collector for raider signs
        let collector = message.createReactionCollector(
            this._reactionFilter, //filter function for reactions (don't want non raiders)
            { time: COLLECTOR_LISTEN_TIME }
        );

        collector.on('collect', (reaction) => {
            let emoji = reaction.emoji.name;
            let user = reaction.users.last();

            //Ignore slackbot and other bots
            if (user.bot) {
                return;
            }

            if (emoji == TICK_EMOJI) {
                //check if they have already signed
                if (message.signUps.indexOf(user.id) != -1) {
                    return;
                }

                //check if they unsigned, if so remove from unsigned list
                let unsignKey = message.unsigns.indexOf(user.id);

                if (unsignKey > -1) {
                    message.unsigns.splice(unsignKey, 1);
                }

                message.signUps.push(user.id);
                this.handleSign(user, eventDate);
            } else if (emoji == CROSS_EMOJI) {
                //check if they have already unsigned
                if (message.unsigns.indexOf(user.id) != -1) {
                    return;
                }

                //check if they signed, if so remove from signed list
                let signKey = message.signUps.indexOf(user.id);

                if (signKey > -1) {
                    message.signUps.splice(signKey, 1);
                }

                message.unsigns.push(user.id);
                this.handleUnsign(user, eventDate);
            }
        });

        collector.on('end', () => {
            console.log("end");
            //TODO: do we clear up events here?
        });
    }

    _reactionFilter(reaction, user) {
        let emoji = reaction.emoji.name;

        return emoji == TICK_EMOJI || emoji == CROSS_EMOJI;
    }

    _notifyEventsReady() {
        setTimeout(() => {
            let channel = this.discord.channels.get(this.config.notifyChannel);

            channel.send("New raids for this week have been posted, go sign/unsign to them in the #events channel");
        }, NOTIFY_DELAY);
    }
}

module.exports = RaidEventHandler;