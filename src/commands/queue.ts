import {
  ChatInputCommandInteraction,
  SlashCommandChannelOption,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { SettingsOptions } from '../utils/types';
import { getGuildFromDb } from '../database/db';
import { getChannel } from '../utils/generalUtilities';

const QUEUE_OPTIONS = {
  join: 'join',
  leave: 'leave',
  invoke: 'invoke',
};

const INDEX_NOT_FOUND = -1;

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('ShortStack queue')
  .addSubcommand(subcommand =>
    subcommand
      .setName(QUEUE_OPTIONS.join)
      .setDescription('Join the Dota 2 queue!')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName(QUEUE_OPTIONS.leave)
      .setDescription('Leave the Dota 2 queue!')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName(QUEUE_OPTIONS.invoke)
      .setDescription('Invoke the Dota 2 queue!')
      .addNumberOption((option: SlashCommandNumberOption) =>
        option
          .setName('invokees')
          .setDescription('How many players do you want from the queue?')
          .setRequired(true)
      )
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const type = interaction.options.getSubcommand();
  console.log('this is the new interaction', interaction);
  const guildId = interaction.guildId;
  if (!guildId) throw new Error('GuildID is falsy!');
  const guildSettings = await getGuildFromDb(guildId);
  switch (type) {
    case QUEUE_OPTIONS.join:
      guildSettings.queue.push(interaction.user.toString());
      interaction.reply(
        `You're in! Queue looks like this: \n ${guildSettings.queue.join('\n')}`
      );
      break;
    case QUEUE_OPTIONS.leave:
      guildSettings.queue = guildSettings.queue.filter(
        user => user !== interaction.user.toString()
      );
      interaction.reply(
        `You're out! Queue looks like this: \n ${guildSettings.queue.join(
          '\n'
        )}`
      );
      break;
    case QUEUE_OPTIONS.invoke:
      const invokeesNeeded = interaction.options.getNumber('invokees');
      if (invokeesNeeded && invokeesNeeded > 0 && invokeesNeeded < 6) {
        interaction.deferReply();
        interaction.deleteReply();
        const channel = await getChannel(
          guildSettings.yaposChannel,
          interaction
        );
      }
      interaction.reply(
        'That is not an appropriate number for a Dota 2 party!'
      );
      break;
  }
  await guildSettings.save();
};
