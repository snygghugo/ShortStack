import {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  CommandInteraction,
} from 'discord.js';

import { SlashCommandBuilder } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder().setName('testing').setDescription('TESTING'),
  async execute(interaction: ChatInputCommandInteraction) {
    console.log('Nu är vi i interaction grejen');
    await interaction.reply('Pong!');
  },
};
