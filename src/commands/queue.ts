import {
  ChatInputCommandInteraction,
  SlashCommandNumberOption,
} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { getGuildFromDb } from '../database/db';
import { getChannel } from '../utils/generalUtilities';
import { invokeMessageCollector } from './queue/queueing';
import { QUEUE_OPTIONS } from '../utils/consts';

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
          .setDescription('How many slots are open?')
          .setRequired(true)
          .addChoices(
            { name: '1 Slot open', value: 1 },
            { name: '2 Slots open', value: 2 },
            { name: '3 Slots open', value: 3 },
            { name: '4 Slots open', value: 4 },
            { name: '5 Slots open', value: 5 }
          )
      )
  );

export const execute = async (interaction: ChatInputCommandInteraction) => {
  const type = interaction.options.getSubcommand();
  const guildId = interaction.guildId;
  if (!guildId) throw new Error('GuildID is falsy!');
  const guildSettings = await getGuildFromDb(guildId);
  switch (type) {
    case QUEUE_OPTIONS.join:
      if (guildSettings.queue.includes(interaction.user.toString())) {
        interaction.reply("You're already in the queue!");
        break;
      }
      guildSettings.queue.push(interaction.user.toString());
      interaction.reply(
        `You're in! Queue looks like this:\n${guildSettings.queue.join('\n')}`
      );
      break;
    case QUEUE_OPTIONS.leave:
      guildSettings.queue = guildSettings.queue.filter(
        user => user !== interaction.user.toString()
      );
      interaction.reply(
        `You're out! Queue looks like this:\n${guildSettings.queue.join('\n')}`
      );
      break;
    case QUEUE_OPTIONS.invoke:
      if (guildSettings.queue.length < 1)
        return interaction.reply('Queue is empty!');
      const invokeesNeeded = interaction.options.getNumber('invokees');
      if (invokeesNeeded && invokeesNeeded > 0 && invokeesNeeded < 6) {
        interaction.deferReply();
        interaction.deleteReply();
        const channel = await getChannel(
          guildSettings.yaposChannel,
          interaction
        );
        const message = await channel.send('Setting up...');
        const toRemove = await invokeMessageCollector(
          message,
          guildSettings.queue,
          invokeesNeeded
        );
        guildSettings.queue = guildSettings.queue.filter(
          queuerId => !toRemove.some(({ id }) => id === queuerId)
        );
        break;
      }
      interaction.reply({
        content: 'That is not an appropriate number for a Dota 2 party!',
        ephemeral: true,
      });
      break;
  }
  await guildSettings.save();
};
