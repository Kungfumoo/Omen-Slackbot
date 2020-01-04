'use strict';

const { RichEmbed } = require('discord.js');
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
        const embed = this._createEventRichEmbed(new Date());
            
        channel.send(embed)
               .then((message) => {
                   //cache signups and unsign ids
                   message.signUps = [];
                   message.unsigns = [];

                   let collector = message.createReactionCollector(
                       this._reactionFilter,
                       { time: 15000 }
                   );

                   collector.on('collect', (reaction) => {
                       let emoji = reaction.emoji.name;
                       let user = reaction.users.last();

                       if (emoji == TICK_EMOJI) {
                           this.handleSign(user);
                       } else if (emoji == CROSS_EMOJI) {
                           this.handleUnsign(user);
                       }
                   });

                   collector.on('end', () => {
                       console.log("end");
                       //TODO:
                   });
               })
               .catch(console.error);

        this.processed = true;
    }

    handleSign(user) {
        console.log("Signed " + user.username);
    }

    handleUnsign(user) {
        console.log("Unsigned " + user.username);
    }

    _createEventRichEmbed(date) {
        let eventMeta = this.config.eventMeta;

        return new RichEmbed()
            .setAuthor("Emerald Omen", eventMeta.iconUrl)
            .setTitle(eventMeta.title)
            .setColor(0xFF0000)
            .addField("Date", date.toLocaleDateString(
                "en-GB",
                { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
            ))
            .setFooter(eventMeta.description);
    }

    _reactionFilter(reaction, user) {
        let emoji = reaction.emoji.name;

        return emoji == TICK_EMOJI || emoji == CROSS_EMOJI;
    }
}

module.exports = RaidEventHandler;