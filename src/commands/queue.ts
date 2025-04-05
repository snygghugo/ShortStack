import {
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
  SlashCommandNumberOption,
} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import {
  addUserToQueue,
  getGuildFromDb,
  removeUserFromQueue,
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
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName(QUEUE_OPTIONS.leave)
      .setDescription('Leave the Dota 2 queue!')
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('Remove another user')
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
      if (guildSettings.queue.includes(interaction.user.toString())) {
        interaction.reply("You're already in the queue!");
        break;
      }

      if (!lastMessageIsQueueMessage) {
        messageToEdit = await interaction.reply('Working...');
        messageId = messageToEdit.id;
      }

      const postJoinGuildSettings = await addUserToQueue(
        guildId,
        interaction.user.toString(),
        messageId!
      );

      const queueMessage = `You're in! Queue looks like this:\n${postJoinGuildSettings.queue.join(
        '\n'
      )}`;

      messageToEdit!.edit(queueMessage);

      break;
    case QUEUE_OPTIONS.leave:
      const userFromParam = interaction.options.getUser('user');
      const userToRemove = userFromParam ?? interaction.user;

      if (!lastMessageIsQueueMessage) {
        messageToEdit = await interaction.reply('Working...');
        messageId = messageToEdit.id;
      }

      const postLeaveGuildSettings = await removeUserFromQueue(
        guildId,
        userToRemove.toString(),
        messageId!
      );

      const outPronoun = userFromParam ? 'Queuer' : "You're";
      messageToEdit!.edit(
        `${outPronoun} out! Queue looks like this:\n${postLeaveGuildSettings.queue.join(
          '\n'
        )}`
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
        const message = await channel.send(
          `Setting up invoke for ${guildSettings.queue.join(' ')}`
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
