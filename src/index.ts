//add roles

import { ChannelType, Client, Collection, GatewayIntentBits } from 'discord.js';
import { connect } from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import { token } from './config.json';
import { CONNECTION } from './utils/consts';
import { transferDb } from './database/transferDb';

interface ClientWithCommands extends Client {
  commands: Collection<string, any>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
}) as ClientWithCommands;
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file: string) => file.endsWith('.ts') || file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}
client.once('ready', async () => {
  console.log('ShortStack 2!');
  try {
    await connect(CONNECTION);
  } catch (error) {
    console.error(error);
  }
  transferDb();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.channel?.type !== ChannelType.GuildText) {
    await interaction.reply({
      content: 'Please only use ShortStack in normal text channels!',
      ephemeral: true,
    });
    return;
  }

  if (interaction.commandName) {
    console.log('Here is the command name', interaction.commandName);
  }
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
      components: [],
    });
  }
});

client.login(token);
