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
        let name = discordUser.nickname;

        if (!name) {
            name = discordUser.displayName;
        }

        //notify admin
        let promise = this.database.addUser(discordUser.id, name);

        promise.then(() => {
            let discordPromise = this.discord.fetchUser(this.config.admin);

            discordPromise.then((adminUser) => {
                name = discordUser.id + " : " + name;

                adminUser.send("Added user " + name);
            });
        });
    }

    syncRoles() {
        //grab current id list
        let promise = this.database.fetchAllUsers();

        promise.then((dbUsers) => {
            //fetch all raiders from discord
            const guild = this.discord.guilds.get(this.config.guild);

            if (!(guild && guild.available)) {
                return;
            }

            let membersWithRole = guild.roles.get(this.config.raiderRole).members; //raider

            membersWithRole.array().forEach((member) => {
                let name = member.nickname;

                if (!name) {
                    name = member.displayName;
                }

                let id = member.id;
                let index = dbUsers.indexOf(id);

                if (index == -1) { //then it's not in the database, so add them
                    this.database.addUser(id, name);
                } else {
                    dbUsers.splice(index, 1); //remove the user as he exists
                }
            });

            //go through remianing dbUsers and remove them from the database.
            dbUsers.forEach((userId) => {
                this.database.removeUser(userId);
            });

            //notify admin
            let discordPromise = this.discord.fetchUser(this.config.admin);

            discordPromise.then((adminUser) => {
                adminUser.send("Finished sync");
            });
        });
    }
}

module.exports = RoleUpdater;
