import {
  ChatInputCommandInteraction,
  SlashCommandNumberOption,
  CollectedInteraction,
  Message,
  ComponentType,
  ButtonStyle,
  Embed,
} from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { getGuildFromDb } from '../database/db';
import { getChannel } from '../utils/generalUtilities';
import { FIVEMINUTES } from '../utils/consts';
import { createButtonRow } from '../utils/view';
import { getTimestamp } from './lfs/utilities';

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
      interaction.reply(
        'That is not an appropriate number for a Dota 2 party!'
      );
      break;
  }
  await guildSettings.save();
};

type Invokee = {
  id: string;
  hasHeeded: boolean;
};

const sortArrays = (invokees: Invokee[], invokeesNeeded: number) => {
  const everyoneHeeded = invokees.filter(({ hasHeeded }) => hasHeeded);
  const confirmedInArray = everyoneHeeded.splice(0, invokeesNeeded);
  const outArray = invokees.filter(({ hasHeeded }) => !hasHeeded);
  return [everyoneHeeded, confirmedInArray, outArray];
};

const fillFields = (
  invokees: Invokee[],
  invokeesNeeded: number,
  isFinished: boolean
) => {
  const [heeded, confirmedIn, noHeed] = sortArrays(invokees, invokeesNeeded);
  const returnArray = [];
  if (confirmedIn.length) {
    returnArray.push({
      name: isFinished ? 'In the stack' : 'Answered call',
      value: confirmedIn.map(({ id }) => id).join('\n'),
    });
  }
  if (heeded.length) {
    returnArray.push({
      name: isFinished ? 'Will remain in queue' : 'Will remain in queue',
      value: heeded.map(({ id }) => id).join('\n'),
      inline: true,
    });
  }
  if (noHeed.length) {
    returnArray.push({
      name: isFinished ? 'Will be removed from queue' : 'No reply',
      value: noHeed.map(({ id }) => id).join('\n'),
      inline: true,
    });
  }
  return returnArray;
};

const createInvokeEmbed = (
  invokees: Invokee[],
  invokeesNeeded: number,
  isFinished: boolean
) => {
  const title = isFinished ? 'Invoke complete!' : 'Invoke in progress...';
  const embed = {
    title,
    fields: fillFields(invokees, invokeesNeeded, isFinished),
  };
  return embed;
};

const invokeMessageCollector = async (
  message: Message<true>,
  queue: string[],
  invokeesNeeded: number
) => {
  const invokees: Invokee[] = queue.map(queuer => ({
    id: queuer,
    hasHeeded: false,
  }));
  const button = createButtonRow(
    'AND THE QUEUE SHALL ANSWER',
    'heedCall',
    ButtonStyle.Primary
  );
  const time = getTimestamp(1000);
  message.edit({
    content: `The Stack calls for aid! \n${queue.join(
      '& '
    )} heed the call or be removed from the queue. Ends in <t:${time}:R>`,
    embeds: [createInvokeEmbed(invokees, invokeesNeeded, false)],
    components: [button],
  });

  const filter = (i: CollectedInteraction) =>
    i.customId === 'heedCall' && queue.includes(`<@${i.user.id}>`);
  const collector = message.createMessageComponentCollector({
    filter,
    time: FIVEMINUTES * 1000,
    componentType: ComponentType.Button,
  });
  collector.on('collect', async i => {
    const heeded = invokees.find(invokee => invokee.id === `<@${i.user.id}>`);
    if (!heeded)
      throw new Error('Could not find this person among the invokees!');
    heeded.hasHeeded = true;
    if (invokees.every(({ hasHeeded }) => hasHeeded)) {
      console.log('Everyone has heeded!');
      collector.stop('Everyone has heeded!');
    }
    await i.update({
      embeds: [createInvokeEmbed(invokees, invokeesNeeded, false)],
    });
  });

  await new Promise<void>((res, _rej) => {
    collector.on('end', async => {
      message.edit({
        content: 'Very cool',
        embeds: [createInvokeEmbed(invokees, invokeesNeeded, true)],
        components: [],
      });
      res();
    });
  });
  const [_, ...toRemove] = sortArrays(invokees, invokeesNeeded);
  return toRemove.flat();
};
