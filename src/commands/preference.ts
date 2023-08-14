import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { prefEmbedMaker } from '../utils/view';
import { reactionCollector } from './preference/reactionsCollector';
import { updateUserPrefs } from '../database/db';

export const data = new SlashCommandBuilder()
  .setName('preference')
  .setDescription('Set your role preferences');
export const execute = async (interaction: ChatInputCommandInteraction) => {
  const interactionUser = interaction.user;
  const createdMessage = await interaction.reply({
    embeds: [prefEmbedMaker()],
    fetchReply: true,
  });
  const chosenRoles = await reactionCollector(createdMessage, interactionUser);
  updateUserPrefs(interaction.user.id, chosenRoles);
};
