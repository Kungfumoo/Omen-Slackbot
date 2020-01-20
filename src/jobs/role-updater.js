'use strict';

var Job = require("./job.js");

class RoleUpdater extends Job {
    handleRoleRemoval(discordUser) {
        let promise = this.database.removeUser(discordUser.id);

        promise.then(() => {
            //notify admin
            let discordPromise = this.discord.fetchUser(this.config.admin);

            discordPromise.then((adminUser) => {
                let name = discordUser.nickname;

                if (!name) {
                    name = discordUser.displayName;
                }

                name = discordUser.id + " : " + name;

                adminUser.send("Removed user " + name);
            });
        });
    }

    handleRoleAdd(discordUser) {
        let promise = this.database.addUser(discordUser.id, discordUser.name);

        promise.then(() => {
            //notify admin
            let discordPromise = this.discord.fetchUser(this.config.admin);

            discordPromise.then((adminUser) => {
                let name = discordUser.nickname;

                if (!name) {
                    name = discordUser.displayName;
                }

                name = discordUser.id + " : " + name;

                adminUser.send("Added user " + name);
            });
        });
    }

    syncRoles() {
        //TODO: grab current id list, get all raiders from discord, go through discord list, add if not in database, remove if not in discord list
    }
}

module.exports = RoleUpdater;
