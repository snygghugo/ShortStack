import {
  ChatInputCommandInteraction,
  SlashCommandUserOption,
} from 'discord.js';
import { setUp } from './lfs/lobby';
import { createConfirmedPlayers } from './lfs/utilities';
import { SlashCommandBuilder } from 'discord.js';
let playerNo = 2;
const addUser = (option: SlashCommandUserOption) =>
  option
    .setName(`p${playerNo++}`)
    .setDescription('Anyone else?')
    .setRequired(false);

export const data = new SlashCommandBuilder()
  .setName('lfs')
  .setDescription('Time to gauge dota interest')
  .addUserOption(addUser)
  .addUserOption(addUser)
  .addUserOption(addUser)
  .addUserOption(addUser)
  .addIntegerOption((option) =>
    option
      .setName('timelimit')
      .setDescription('How long can you wait for a Stack?')
      .setRequired(false)
      .setMinValue(5)
      .setMaxValue(120),
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.deferReply();

  const confirmedPlayers = await createConfirmedPlayers(interaction);
  if (!confirmedPlayers) {
    await interaction.editReply(
      'Please provide unique players!\nLove, **ShortStack!**',
    );
    return;
  }
  await interaction.deleteReply();
  await setUp(interaction, confirmedPlayers);
};
