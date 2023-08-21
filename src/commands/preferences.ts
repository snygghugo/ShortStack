import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { prefEmbedMaker } from '../utils/view';
import { reactionCollector } from './preferences/reactionsCollector';
import { updateUserPrefs } from '../database/db';
import { getTimestamp } from './lfs/utilities';
import { preferenceCollector } from './preferences/preferenceCollector';

export const data = new SlashCommandBuilder()
  .setName('preferences')
  .setDescription('Set your role preferences');
export const execute = async (interaction: ChatInputCommandInteraction) => {
  // const chosenRoles = await reactionCollector(createdMessage, interactionUser);
  const chosenRoles = await preferenceCollector(interaction);

  console.log('this is chosenroles', chosenRoles);
  if (chosenRoles.length === 0) {
    console.log('Quitting the thing without changing anything');
    return;
  }
  await updateUserPrefs(interaction.user.id, chosenRoles);
};
