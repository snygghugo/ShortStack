import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandUserOption,
} from 'discord.js';
import { shuffle } from '../utils/generalUtilities';
import { getHandle } from '../utils/generalUtilities';
import { stackSetup } from './stack/stacking';
import { getSettings, getPreferences } from '../database/db';
import { PlayerObject } from '../utils/types';

const STANDARD_TIME = 60;
const DOTA_PARTY_SIZE = 5;

const createPlayerArray = async (
  interaction: ChatInputCommandInteraction
): Promise<PlayerObject[]> => {
  const playerArray: PlayerObject[] = [];
  if (!interaction.guildId) return playerArray;
  let guildHasPreferences = false;
  const settingsObject = await getSettings();
  if (interaction.guildId in settingsObject) {
    console.log('There is a guildId in the settings object');
    guildHasPreferences = true;
  }
  if (!interaction.guildId) return playerArray;

  for (let i = 1; i < DOTA_PARTY_SIZE + 1; i++) {
    const userToAdd = interaction.options.getUser('p' + i);
    if (!userToAdd) throw new Error('Unable to find user!');
    if (playerArray.some(({ user }) => user.id === userToAdd.id)) {
      interaction.reply('Please provide 5 unique players!');
    }
    let preferences = ['fill'];
    if (guildHasPreferences) {
      preferences = getPreferences(
        userToAdd,
        settingsObject,
        interaction.guildId
      );
    }
    console.log(
      `${userToAdd.username} has prefs like this ${preferences.join(' > ')}`
    );
    const playerToAdd = {
      user: userToAdd,
      handle: getHandle(userToAdd),
      position: 'Has not picket yet',
      preferences: preferences,
      randomed: 0,
    };
    playerArray.push(playerToAdd);
  }
  return shuffle(playerArray);
};
let playerNo = 1;
const addUser = (option: SlashCommandUserOption) => {
  return option
    .setName(`p${playerNo++}`)
    .setDescription('Select a player')
    .setRequired(true);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stack')
    .setDescription('Dota 2 role selection tool')
    .addUserOption(addUser)
    .addUserOption(addUser)
    .addUserOption(addUser)
    .addUserOption(addUser)
    .addUserOption(addUser)
    .addIntegerOption(option =>
      option.setName('time').setDescription('Pick time')
    ),
  execute: async function setup(interaction: ChatInputCommandInteraction) {
    const pickTime = interaction.options.getInteger('time') || STANDARD_TIME;
    const playerArray = await createPlayerArray(interaction);
    stackSetup(interaction, playerArray, pickTime);
  },
};
