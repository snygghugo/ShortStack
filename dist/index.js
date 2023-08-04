"use strict";
//add roles
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
    ],
});
client.commands = new Collection();
const commandsPath = node_path_1.default.join(__dirname, 'commands');
const commandFiles = node_fs_1.default
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.ts'));
for (const file of commandFiles) {
    const filePath = node_path_1.default.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}
client.once('ready', () => {
    console.log('ShortStack 2!');
});
client.on('interactionCreate', async (interaction) => {
    if (interaction.commandName) {
        console.log('Here is the command name', interaction.commandName);
    }
    client.commands.get();
    const command = client.commands.get(interaction.commandName);
    if (!interaction.isChatInputCommand())
        return;
    if (!command)
        return;
    try {
        command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
            components: [],
        });
    }
});
client.login(token);
