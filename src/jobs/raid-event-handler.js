'use strict';

const { RichEmbed } = require('discord.js');
const Job = require("./job.js");

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
            
        channel.send(embed);

        this.processed = true;
    }

    handleReaction() {

    }

    _createEventRichEmbed(date) {
        let eventMeta = this.config.eventMeta;

        return new RichEmbed()
            .setAuthor("Emerald Omen", eventMeta.iconUrl)
            .setTitle(eventMeta.title)
            .setColor(0xFF0000)
            .addField("Date", date.toLocaleDateString(
                "en-GB",
                {
                    "weekdays": "long"
                }
            ))
            .setFooter(eventMeta.description);
    }
}

module.exports = RaidEventHandler;