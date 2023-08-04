"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const discord_js_2 = require("discord.js");
const utilities_1 = require("../utils/utilities");
module.exports = {
    data: new discord_js_2.SlashCommandBuilder()
        .setName('channel')
        .setDescription('Designate where ShortStack should publish')
        .addChannelOption((option) => option
        .setName('output')
        .setDescription('Set ShortStack output')
        .setRequired(true)),
    async execute(interaction) {
        const channel = interaction.options.getChannel('output');
        if (!channel)
            return;
        if (channel.type === discord_js_1.ChannelType.GuildText) {
            console.log('This is a text channel baby');
            await (0, utilities_1.saveYapos)(interaction, channel.id);
            interaction.reply(`Roger! In the future I will output in ${channel}.`);
            return;
        }
        await interaction.reply('Please choose a text channel');
        return;
    },
};
