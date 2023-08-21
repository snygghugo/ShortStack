import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { updateUserPrefs } from '../database/db';
import { preferenceCollector } from './preferences/preferenceCollector';

export const data = new SlashCommandBuilder()
  .setName('preferences')
  .setDescription('Set your role preferences');
export const execute = async (interaction: ChatInputCommandInteraction) => {
  const chosenRoles = await preferenceCollector(interaction);
  console.log('this is chosenroles', chosenRoles);
  if (chosenRoles.length === 0) {
    console.log('Quitting the interaction early without changing anything');
    return;
  }
  await updateUserPrefs(interaction.user.id, chosenRoles);
};
