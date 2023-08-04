import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { prefEmbedMaker } from '../utils/view';
import { reactionCollector } from './preference/reactionsCollector';
import { savePreferences } from '../database/db';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('preference')
    .setDescription('Set your role preferences'),
  async execute(interaction: ChatInputCommandInteraction) {
    const interactionUser = interaction.user;
    const createdMessage = await interaction.reply({
      embeds: [prefEmbedMaker()],
      fetchReply: true,
    });
    const chosenRoles = await reactionCollector(
      createdMessage,
      interactionUser
    );
    savePreferences(interaction, chosenRoles);
  },
};
