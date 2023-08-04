"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const view_1 = require("../utils/view");
const utilities_1 = require("../utils/utilities");
const reactionsCollector_1 = require("../discordLogic/reactionsCollector");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('preference')
        .setDescription('Set your role preferences'),
    async execute(interaction) {
        const interactionUser = interaction.user;
        const createdMessage = await interaction.reply({
            embeds: [(0, view_1.prefEmbedMaker)()],
            fetchReply: true,
        });
        const chosenRoles = await (0, reactionsCollector_1.reactionCollector)(createdMessage, interactionUser);
        (0, utilities_1.savePreferences)(interaction, chosenRoles);
    },
};
