"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsCompliantIncludes = exports.savePreferences = exports.saveYapos = exports.getPreferences = exports.getSettings = exports.shuffle = void 0;
const fs_1 = require("fs");
function shuffle([...array]) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
}
exports.shuffle = shuffle;
const getSettings = async () => {
    const settingsObject = JSON.parse(await fs_1.promises.readFile('settings.json', 'utf-8'));
    return settingsObject;
};
exports.getSettings = getSettings;
const getPreferences = (user, settingsObject, guildId) => {
    return settingsObject[guildId].players[user.toString()];
};
exports.getPreferences = getPreferences;
const saveYapos = async (interaction, channel) => {
    if (!interaction.guildId)
        throw new Error('Something with guildId');
    const settings = await (0, exports.getSettings)();
    if (!(interaction.guildId in settings))
        settings[interaction.guildId] = { players: {} };
    settings[interaction.guildId].yaposChannel = channel;
    await writeSettings(settings);
};
exports.saveYapos = saveYapos;
const savePreferences = async (interaction, choices) => {
    if (!interaction.guildId)
        throw new Error('Something with guildId');
    const settings = await (0, exports.getSettings)();
    if (!(interaction.guildId in settings)) {
        settings[interaction.guildId] = { players: {} };
    }
    settings[interaction.guildId].players[interaction.user.toString()] = choices;
    await writeSettings(settings);
};
exports.savePreferences = savePreferences;
const tsCompliantIncludes = (array, x) => {
    if (!x)
        return false;
    return array.includes(x);
};
exports.tsCompliantIncludes = tsCompliantIncludes;
const writeSettings = async (settings) => {
    await fs_1.promises.writeFile('settings.json', JSON.stringify(settings), 'utf-8');
};
