import {
  ChannelType,
  ChatInputCommandInteraction,
  SlashCommandChannelOption,
  SlashCommandRoleOption,
} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { SettingsOptions } from '../utils/utilities';
import { saveSettings } from '../database/db';

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('ShortStack settings')
  .addSubcommand(subcommand =>
    subcommand
      .setName('stackschannel')
      .setDescription('Set where ShortStack publishes the stack stuff')
      .addChannelOption((option: SlashCommandChannelOption) =>
        option
          .setName('stacks')
          .setDescription('Set where ShortStack publishes the stack stuff')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('role')
      .setDescription('Set which role ShortStack @pings')
      .addRoleOption((option: SlashCommandRoleOption) =>
        option
          .setName('ping')
          .setDescription('Set which role ShortStack @pings')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('trashchannel')
      .setDescription('Set where ShortStack publishes trash')
      .addChannelOption((option: SlashCommandChannelOption) =>
        option
          .setName('trash')
          .setDescription(
            'Set where ShortStack publishes the less important trash stuff'
          )
          .setRequired(true)
      )
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const stacks = interaction.options.getChannel('stacks');
  const trash = interaction.options.getChannel('trash');
  const role = interaction.options.getRole('ping');
  if (
    (stacks && stacks?.type !== ChannelType.GuildText) ||
    (trash && trash?.type !== ChannelType.GuildText)
  ) {
    return interaction.reply(
      'Please choose a text channel, it would be weird if I joined voice and dictated my output...'
    );
  }
  let reply = 'Nothing was changed!';
  const options: SettingsOptions = {};
  if (stacks) {
    options.stacks = stacks.id;
    reply = `Roger! In the future I will output the good stuff in ${stacks}.`;
  }
  if (role) {
    options.role = role.id;
    reply = `Roger! In the future I will ping ${role} when I set up a stack.`;
  }
  if (trash) {
    options.trash = trash.id;
    reply = `Roger! In the future I will output the trash stuff in ${trash}`;
  }
  console.log('this is channel and role', options);
  console.log('This is a text channel baby');
  await saveSettings(interaction, options);
  interaction.reply(reply);
  return;
};