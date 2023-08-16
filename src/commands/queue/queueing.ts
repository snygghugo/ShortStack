import { CollectedInteraction, ComponentType, Message } from 'discord.js';
import { Invokee } from '../../utils/types';
import { createButtonRow } from '../../utils/view';
import { QUEUE_BUTTON } from '../../utils/buttons/buttonConsts';
import { FIVEMINUTES } from '../../utils/consts';
import { getTimestamp } from '../lfs/utilities';

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

export const invokeMessageCollector = async (
  message: Message<true>,
  queue: string[],
  invokeesNeeded: number
) => {
  const invokees: Invokee[] = queue.map(queuer => ({
    id: queuer,
    hasHeeded: false,
  }));

  const button = createButtonRow(QUEUE_BUTTON);
  const time = getTimestamp(1000);
  message.edit({
    content: `The Stack calls for aid!\n${queue.join(
      '& '
    )} heed the call or be removed from the queue. Ends in <t:${
      time + FIVEMINUTES
    }:R>`,
    embeds: [createInvokeEmbed(invokees, invokeesNeeded, false)],
    components: [button],
  });

  const filter = (i: CollectedInteraction) =>
    i.customId === QUEUE_BUTTON.btnId && queue.includes(`<@${i.user.id}>`);
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
        content: '',
        embeds: [createInvokeEmbed(invokees, invokeesNeeded, true)],
        components: [],
      });
      res();
    });
  });
  const [_, ...toRemove] = sortArrays(invokees, invokeesNeeded);
  return toRemove.flat();
};
