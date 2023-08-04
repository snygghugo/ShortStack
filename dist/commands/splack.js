"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const utilities_1 = require("../utils/utilities");
const utilities_2 = require("../utils/utilities");
const stacking_1 = require("../discordLogic/stacking");
const STANDARD_TIME = 60;
const DOTA_PARTY_SIZE = 5;
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('splack')
        .setDescription('Dota 2 role selection tool')
        .addUserOption(option => option.setName('p1').setDescription('Select a player').setRequired(true))
        .addUserOption(option => option.setName('p2').setDescription('Select a player').setRequired(true))
        .addUserOption(option => option.setName('p3').setDescription('Select a player').setRequired(true))
        .addUserOption(option => option.setName('p4').setDescription('Select a player').setRequired(true))
        .addUserOption(option => option.setName('p5').setDescription('Select a player').setRequired(true))
        .addIntegerOption(option => option.setName('time').setDescription('Pick time')),
    execute: async function setup(interaction) {
        const pickTime = interaction.options.getInteger('time') || STANDARD_TIME;
        const playerArray = await createPlayerArray(interaction);
        (0, stacking_1.stackSetup)(interaction, playerArray, pickTime);
    },
};
const createPlayerArray = async (interaction) => {
    const playerArray = [];
    if (!interaction.guildId)
        return playerArray;
    let guildHasPreferences = false;
    const settingsObject = await (0, utilities_2.getSettings)();
    if (interaction.guildId in settingsObject) {
        console.log('There is a guildId in the settings object');
        guildHasPreferences = true;
    }
    if (!interaction.guildId)
        return playerArray;
    for (let i = 1; i < DOTA_PARTY_SIZE + 1; i++) {
        const userToAdd = interaction.options.getUser('p' + i);
        if (!userToAdd)
            throw new Error('Unable to find user!');
        if (playerArray.some(({ user }) => user.id === userToAdd.id)) {
            interaction.reply('Please provide 5 unique players!');
        }
        let preferences = ['fill'];
        if (guildHasPreferences) {
            preferences = (0, utilities_1.getPreferences)(userToAdd, settingsObject, interaction.guildId);
        }
        console.log(`${userToAdd.username} has prefs like this ${preferences.join(' > ')}`);
        const playerToAdd = {
            user: userToAdd,
            position: 'Has not picket yet',
            preferences: preferences,
            randomed: 0,
        };
        playerArray.push(playerToAdd);
    }
    return (0, utilities_1.shuffle)(playerArray);
};
