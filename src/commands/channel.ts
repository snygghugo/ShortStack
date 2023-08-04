import {
  ChannelType,
  ChatInputCommandInteraction,
  SlashCommandChannelOption,
} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { saveYapos } from '../utils/utilities';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channel')
    .setDescription('Designate where ShortStack should publish')
    .addChannelOption((option: SlashCommandChannelOption) =>
      option
        .setName('output')
        .setDescription('Set ShortStack output')
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel('output');
    if (!channel) return;
    if (channel.type === ChannelType.GuildText) {
      console.log('This is a text channel baby');
      await saveYapos(interaction, channel.id);
      interaction.reply(`Roger! In the future I will output in ${channel}.`);
      return;
    }
    await interaction.reply('Please choose a text channel');
    return;
  },
};
