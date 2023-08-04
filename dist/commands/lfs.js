"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yapos_1 = require("../working/yapos");
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('lfs')
        .setDescription('Time to gauge dota interest')
        .addUserOption(option => option.setName('p2').setDescription('Anyone else?').setRequired(false))
        .addUserOption(option => option.setName('p3').setDescription('Anyone else?').setRequired(false))
        .addUserOption(option => option.setName('p4').setDescription('Anyone else?').setRequired(false))
        .addUserOption(option => option.setName('p5').setDescription('Anyone else?').setRequired(false)),
    async execute(interaction) {
        const confirmedPlayers = (0, yapos_1.arrayMaker)(interaction);
        if (!confirmedPlayers) {
            interaction.reply('Please provide unique players!\nLove, **ShortStack!**');
            return;
        }
        interaction.deferReply();
        interaction.deleteReply();
        await (0, yapos_1.setUp)(interaction, confirmedPlayers);
    },
};
