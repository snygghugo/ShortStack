import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
  SlashCommandNumberOption,
} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import {
  addUsersToQueue,
  getGuildFromDb,
  removeUsersFromQueue,
} from '../database/db';
import { invokeMessageCollector } from './queue/queueing';
import { QUEUE_OPTIONS } from '../utils/consts';
import { getGuildId, getChannel } from '../utils/getters';

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('ShortStack queue')
  .addSubcommand((subcommand) =>
    subcommand
      .setName(QUEUE_OPTIONS.join)
      .setDescription('Join the Dota 2 queue!')
      .addStringOption((option) =>
        option
          .setName('user')
          .setDescription('Add other users')
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName(QUEUE_OPTIONS.leave)
      .setDescription('Leave the Dota 2 queue!')
      .addStringOption((option) =>
        option
          .setName('user')
          .setDescription('Remove other users')
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
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
  const guildId = getGuildId(interaction);
  const guildSettings = await getGuildFromDb(guildId);
  const lastMessage = (
    await interaction.channel?.messages.fetch({
      limit: 1,
    })
  )?.first();
  const lastMessageIsQueueMessage =
    lastMessage && lastMessage.id === guildSettings.lastQueueMessageId;
  let messageToEdit: Message | InteractionResponse | undefined = lastMessage;
  let messageId = lastMessage?.id;

  switch (type) {
    case QUEUE_OPTIONS.join:
      const joinUsersString = interaction.options.getString('user');
      let usersToAdd = [interaction.user.id];

      if (joinUsersString) {
        const idMatches = joinUsersString
          ? [...joinUsersString.matchAll(/<@!?(?<id>\d+)>/g)]
          : [];

        if (!idMatches) {
          messageToEdit!.edit('No valid users entered');
          break;
        }
        usersToAdd = [...idMatches.map((m) => m.groups!.id)];
      } else if (guildSettings.queue.includes(interaction.user.id)) {
        interaction.reply("You're already in the queue!");
        break;
      }

      if (!lastMessageIsQueueMessage) {
        messageToEdit = await interaction.reply('Adding to queue...');
        messageId = messageToEdit.id;
      }

      const postJoinGuildSettings = await addUsersToQueue(
        guildId,
        usersToAdd,
        messageId!
      );

      const joinMentionLines = postJoinGuildSettings.queue.map(
        (id) => `<@${id}>`
      );
      const joinSIfMany = usersToAdd?.length > 1 ? 's' : '';
      const joinPronoun = joinUsersString ? `Queuer${joinSIfMany}` : "You're";
      const queueMessage = `${joinPronoun} in! Queue looks like this:\n${joinMentionLines.join(
        '\n'
      )}`;

      messageToEdit!.edit(queueMessage);

      break;
    case QUEUE_OPTIONS.leave:
      let usersToRemove = [interaction.user.id];
      const usersString = interaction.options.getString('user');

      if (usersString) {
        const idMatches = usersString
          ? [...usersString.matchAll(/<@!?(?<id>\d+)>/g)]
          : [];
        if (!idMatches) {
          messageToEdit!.edit('No valid users entered');
          return;
        }
        usersToRemove = [...idMatches.map((m) => m.groups!.id)];
      }

      if (!lastMessageIsQueueMessage) {
        messageToEdit = await interaction.reply('Removing from queue...');
        messageId = messageToEdit.id;
      }

      const postLeaveGuildSettings = await removeUsersFromQueue(
        guildId,
        usersToRemove,
        messageId!
      );
      const sIfMany = usersToRemove.length > 1 ? 's' : '';
      const outPronoun = usersString ? `Queuer${sIfMany}` : "You're";
      const mentionLines = postLeaveGuildSettings.queue.map((id) => `<@${id}>`);
      messageToEdit!.edit(
        `${outPronoun} out! Queue looks like this:\n${mentionLines.join('\n')}`
      );
      break;
    case QUEUE_OPTIONS.invoke:
      if (guildSettings.queue.length < 1)
        return interaction.reply('Queue is empty!');
      const invokeesNeeded = interaction.options.getNumber('invokees');
      if (invokeesNeeded) {
        interaction.deferReply();
        interaction.deleteReply();
        const channel = await getChannel(
          guildSettings.yaposChannel,
          interaction
        );
        const mentionLines = guildSettings.queue.map((id) => `<@${id}>`);
        const message = await channel.send(
          `Setting up invoke for ${mentionLines.join(' ')}`
        );
        const toRemove = await invokeMessageCollector(
          message,
          guildSettings.queue,
          invokeesNeeded
        );
        const postInvokeGuildSettings = await getGuildFromDb(guildId);
        postInvokeGuildSettings.queue = postInvokeGuildSettings.queue.filter(
          (queuerId) => !toRemove.some(({ id }) => id === queuerId)
        );

        await postInvokeGuildSettings.save();
        break;
      }
      interaction.reply({
        content: 'That is not an appropriate number for a Dota 2 party!',
        ephemeral: true,
      });

      break;
  }
};
