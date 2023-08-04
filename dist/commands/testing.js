"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder().setName('testing').setDescription('TESTING'),
    async execute(interaction) {
        console.log('Nu är vi i interaction grejen');
        await interaction.reply('Pong!');
    },
};
