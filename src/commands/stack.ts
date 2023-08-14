import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandUserOption,
} from 'discord.js';
import { getNickname, shuffle } from '../utils/generalUtilities';
import { stackSetup } from './stack/stacking';
import { getUserPrefs } from '../database/db';
import { PlayerObject } from '../utils/types';

const STANDARD_TIME = 60;
const DOTA_PARTY_SIZE = 5;

const createPlayerArray = async (interaction: ChatInputCommandInteraction) => {
  const playerArray: PlayerObject[] = [];
  if (!interaction.guildId) return playerArray;

  for (let i = 1; i < DOTA_PARTY_SIZE + 1; i++) {
    try {
      const userToAdd = interaction.options.getUser('p' + i);
      if (!userToAdd) throw new Error('Unable to find user!');
      if (playerArray.some(({ user }) => user.id === userToAdd.id)) {
        interaction.reply('Please provide 5 unique players!');
        return;
      }
      const preferences = await getUserPrefs(userToAdd.id);
      const nickname = await getNickname(interaction, userToAdd);
      const playerToAdd = {
        user: userToAdd,
        nickname,
        position: '',
        preferences,
        randomed: 0,
        artTarget: false,
        fillFlag: false,
      };
      playerArray.push(playerToAdd);
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error(error);
      await interaction.reply({
        content:
          'Something went wrong when setting up the player array! ' + errorMsg,
        embeds: [],
        components: [],
      });
      return;
    }
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

export const data = new SlashCommandBuilder()
  .setName('stack')
  .setDescription('Dota 2 role selection tool')
  .addUserOption(addUser)
  .addUserOption(addUser)
  .addUserOption(addUser)
  .addUserOption(addUser)
  .addUserOption(addUser)
  .addIntegerOption(option =>
    option.setName('time').setDescription('Pick time')
  );
export const execute = async (interaction: ChatInputCommandInteraction) => {
  const pickTime = interaction.options.getInteger('time') || STANDARD_TIME;
  const playerArray = await createPlayerArray(interaction);
  if (!playerArray) return;
  stackSetup(interaction, playerArray, pickTime);
};
