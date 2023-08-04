import {
  ChatInputCommandInteraction,
  Message,
  MessageReaction,
  SlashCommandBuilder,
  User,
} from 'discord.js';
import { prefEmbedMaker } from '../utils/view';
import { savePreferences } from '../utils/utilities';
import { reactionCollector } from '../discordLogic/reactionsCollector';

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
