import {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  CommandInteraction,
} from 'discord.js';
import { setUp, arrayMaker } from './lfs/yapos';
import { SlashCommandBuilder } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lfs')
    .setDescription('Time to gauge dota interest')
    .addUserOption(option =>
      option.setName('p2').setDescription('Anyone else?').setRequired(false)
    )
    .addUserOption(option =>
      option.setName('p3').setDescription('Anyone else?').setRequired(false)
    )
    .addUserOption(option =>
      option.setName('p4').setDescription('Anyone else?').setRequired(false)
    )
    .addUserOption(option =>
      option.setName('p5').setDescription('Anyone else?').setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const confirmedPlayers = arrayMaker(interaction);
    if (!confirmedPlayers) {
      interaction.reply(
        'Please provide unique players!\nLove, **ShortStack!**'
      );
      return;
    }

    interaction.deferReply();
    interaction.deleteReply();
    await setUp(interaction, confirmedPlayers);
  },
};
