import {
  ButtonInteraction,
  ThreadChannel,
  CollectedInteraction,
} from 'discord.js';
import { ConfirmedPlayer, PlayerToReady, Dummy } from '../../utils/types';

export const createDummy = (name: string): Dummy => ({
  name,
  id: name,
  username: name,
  user: { username: name },
  displayAvatarURL: () => 'https://laggan.online/dummy.png',
  isDummy: true,
});

export const removeFromArray = (
  array: ConfirmedPlayer[] | ConfirmedPlayer[],
  interaction: ButtonInteraction
) => {
  const index = array.findIndex(
    ({ player }) => player.id === interaction.user.id
  );
  if (index > -1) {
    array.splice(index, 1); //Return the array instead probably
    return true;
  } else {
    return false;
  }
};

export const getTimestamp = (mod: number) => {
  return Math.floor(Date.now() / mod);
};

export const handleIt = async (
  i: CollectedInteraction,
  flavourText: string
) => {
  try {
    console.log('Handling it!');
    await i.reply(flavourText);
    await i.deleteReply();
  } catch (error) {
    console.log(error);
  }
};

export const forceReady = (readyArray: PlayerToReady[], pickTime: number) => {
  for (const player of readyArray) {
    if (!player.ready) {
      player.ready = true;
      player.pickTime = pickTime;
    }
  }
};

export const everyoneReady = (readyArray: PlayerToReady[]) =>
  readyArray.every(({ ready }) => ready);

export const pingMessage = async (
  readyArray: PlayerToReady[],
  partyThread: ThreadChannel
) => {
  const reminders = [];
  for (let player of readyArray) {
    if (!player.ready) {
      const gentleReminder = await partyThread.send(
        `${player.gamer.toString()} hurry up, we're waiting!`
      );
      reminders.push(gentleReminder);
    }
  }
  reminders.forEach(async message => await message.delete());
};
