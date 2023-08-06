import {
  ChatInputCommandInteraction,
  SlashCommandUserOption,
} from 'discord.js';
import { setUp, createConfirmedPlayers } from './lfs/yapos';
import { SlashCommandBuilder } from 'discord.js';
let playerNo = 2;
const addUser = (option: SlashCommandUserOption) =>
  option
    .setName(`p${playerNo++}`)
    .setDescription('Anyone else?')
    .setRequired(false);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lfs')
    .setDescription('Time to gauge dota interest')
    .addUserOption(addUser)
    .addUserOption(addUser)
    .addUserOption(addUser)
    .addUserOption(addUser),

  async execute(interaction: ChatInputCommandInteraction) {
    const confirmedPlayers = await createConfirmedPlayers(interaction);
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
