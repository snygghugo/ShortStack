import {
  ChannelType,
  ChatInputCommandInteraction,
  SlashCommandBooleanOption,
  SlashCommandChannelOption,
  SlashCommandRoleOption,
} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { getGuildFromDb } from '../database/db';
import { type } from 'os';
import { isBooleanObject } from 'util/types';

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('ShortStack settings')
  .addSubcommand(subcommand =>
    subcommand
      .setName('stackschannel')
      .setDescription('Set where ShortStack publishes the stack stuff')
      .addChannelOption((option: SlashCommandChannelOption) =>
        option
          .setName('stackschannel')
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
          .setName('role')
          .setDescription('Set which role ShortStack @pings')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('strictpicking')
      .setDescription(
        'Restrict everyone from being able to select roles for anyone'
      )
      .addBooleanOption((option: SlashCommandBooleanOption) =>
        option
          .setName('strictpicking')
          .setDescription(
            'Restrict everyone from being able to select roles for anyone'
          )
          .setRequired(true)
      )
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guildId) throw new Error('GuildId is falsy');

  const commandName = interaction.options.data[0];
  if (!commandName) throw new Error('Unable to get commandName');
  const stacksChannel = interaction.options.getChannel('stackschannel');
  const role = interaction.options.getRole('role');
  const strictPicking = interaction.options.getBoolean(
    'strictpicking'
  ) as boolean; //TODO: Find better way to typeguard this
  const guildSettings = await getGuildFromDb(interaction.guildId);
  let reply = 'Nothing was changed!';

  switch (commandName.name) {
    case 'stackschannel':
      if (!stacksChannel) throw new Error('Unable to get stacksChannel!');
      if (stacksChannel.type !== ChannelType.GuildText) {
        return interaction.reply({
          content: 'Please choose a standard text channel!',
          ephemeral: true,
        });
      }
      guildSettings.yaposChannel = stacksChannel.id;
      reply = `Roger! In the future I will output the good stuff in ${stacksChannel}.`;
      break;
    case 'role':
      if (!role) throw new Error('Unable to get role!');
      if (role.id === interaction.guildId) {
        return interaction.reply({
          content: "Don't make me ping everyone please!",
          ephemeral: true,
        });
      }
      guildSettings.yaposRole = role.id;
      reply = `Roger! In the future I will ping ${role} when I set up a stack!\nRemember to set "Allow anyone to @mention this role" to ON in Server Settings -> Roles -> ${role}, the setting is at the bottom of the "Display" section.`;
      break;
    case 'strictpicking':
      guildSettings.strictPicking = strictPicking;
      if (strictPicking) {
        reply =
          'Roger! From now on, only the picking player and the creator of the Stack can pick roles!';
      } else {
        reply = 'Roger! From now on, anyone can help anyone pick roles!';
      }
      break;
  }
  await guildSettings.save();
  interaction.reply({ content: reply, ephemeral: false });
  return;
};
