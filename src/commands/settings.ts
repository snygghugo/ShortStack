import {
  ChannelType,
  ChatInputCommandInteraction,
  SlashCommandBooleanOption,
  SlashCommandChannelOption,
  SlashCommandRoleOption,
} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { getGuildFromDb } from '../database/db';
import { getGuildId } from '../utils/getters';

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

const throwIfNullOrUndefined = <Type>(
  thingToCheck: Type | undefined | null
) => {
  if (thingToCheck) {
    return thingToCheck;
  }
  throw new Error(`Unable to get ${{ thingToCheck }}`);
};

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const guildId = getGuildId(interaction);
  const commandName = throwIfNullOrUndefined(
    interaction.options.getSubcommand()
  );
  const guildSettings = await getGuildFromDb(guildId);
  let reply = 'Nothing was changed!';

  switch (commandName) {
    case 'stackschannel':
      const stacksChannel = interaction.options.getChannel('stackschannel');
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
      const role = interaction.options.getRole('role');
      if (!role) throw new Error('Unable to get role!');
      if (role.id === interaction.guildId) {
        return interaction.reply({
          content: "Don't make me ping everyone please!",
          ephemeral: true,
        });
      }
      guildSettings.yaposRole = role.id;
      reply = `Roger! In the future I will ping ${role} when I set up a stack!`;
      break;
    case 'strictpicking':
      const strictPicking = interaction.options.getBoolean('strictpicking');
      if (strictPicking === null)
        throw new Error('Unable to get strictpicking!');
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
