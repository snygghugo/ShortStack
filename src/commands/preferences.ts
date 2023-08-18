import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { prefEmbedMaker } from '../utils/view';
import { reactionCollector } from './preferences/reactionsCollector';
import { updateUserPrefs } from '../database/db';
import { getTimestamp } from './lfs/utilities';

export const data = new SlashCommandBuilder()
  .setName('preferences')
  .setDescription('Set your role preferences');
export const execute = async (interaction: ChatInputCommandInteraction) => {
  const interactionUser = interaction.user;
  const createdMessage = await interaction.reply({
    embeds: [prefEmbedMaker()],
    fetchReply: true,
  });
  const chosenRoles = await reactionCollector(createdMessage, interactionUser);
  await updateUserPrefs(interaction.user.id, chosenRoles);
  const time = getTimestamp(1000);
  await createdMessage.edit({
    content: `All done! This message will self-destruct <t:${time + 60}:R>`,
  });
  setTimeout(() => {
    createdMessage.delete();
  }, 60 * 1000);
};
