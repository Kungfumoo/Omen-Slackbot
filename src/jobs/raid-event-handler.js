'use strict';

const { RichEmbed } = require('discord.js');
const moment = require("moment");
const Job = require("./job.js");
const TICK_EMOJI = '✅';
const CROSS_EMOJI = '❌';

class RaidEventHandler extends Job {
    onInterval() {
        //TODO: publish new events on wednesday
    }

    processJob() {
        if (this.processed) {
            return;
        }

        let channel = this.discord.channels.get(this.config.channel);

        //Publish new events
        this._publishEvent(channel);

        this.processed = true;
    }

    handleSign(user) {
        console.log("Signed " + user.username);
    }

    handleUnsign(user) {
        console.log("Unsigned " + user.username);
    }

    //Recursive utilizing the promise to ensure they are posted in order and serialy
    _publishEvent(channel, eventIndex = 0) {
        let date = this.config.eventDays[eventIndex];

        if (typeof date == "undefined") {
            return;
        }

        let today = moment();
        today.add((7 - today.day()) + date, 'days');

        const embed = this._createEventRichEmbed(today);

        channel.send(embed)
               .then((message) => {
                   this._handleEventMessage(message);
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

    _handleEventMessage(message) {
        //Bot does initial reactions so people can just click
        message.react(TICK_EMOJI)
               .then(() => {
                   message.react(CROSS_EMOJI);
               }); //exploiting the promise to format the reactions in the right order

        //cache signups and unsign ids
        message.signUps = [];
        message.unsigns = [];

        //set up collector for raider signs
        let collector = message.createReactionCollector(
            this._reactionFilter, //filter function for reactions (don't want non raiders)
            { time: 15000 }
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
                this.handleSign(user);
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
                this.handleUnsign(user);
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
}

module.exports = RaidEventHandler;