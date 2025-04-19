import {
  ButtonInteraction,
  ThreadChannel,
  ChatInputCommandInteraction,
} from 'discord.js';
import { ConfirmedPlayer, PlayerToReady, Dummy } from '../../utils/types';
import { getUserPrefs } from '../../database/db';
import { getNickname } from '../../utils/getters';

let lastPing = 0;
const pingCooldownMs = 10_000;

export const createDummy = async (name: string, i: ButtonInteraction) => {
  const foundUser = (
    await i.guild?.members.fetch({
      query: name,
      limit: 1,
    })
  )?.first();
  //TODO: REWRITE THIS GUY TO TAKE MORE THAN 1 AND CHECK WHICH ONE IS MORE APPROPRIATE
  if (foundUser) {
    return {
      user: foundUser.user,
      preferences: await getUserPrefs(foundUser.id),
      nickname: foundUser.nickname || foundUser.displayName,
    };
  }

  return {
    user: {
      name,
      id: name,
      username: name,
      user: { username: name },
      displayAvatarURL: () => 'https://laggan.online/abb.png',
      isDummy: true,
    } as Dummy,
    preferences: ['fill'],
    nickname: name,
  };
};

export const removeFromArray = (
  array: ConfirmedPlayer[] | ConfirmedPlayer[],
  interaction: ButtonInteraction
) => {
  const index = array.findIndex(
    ({ user: player }) => player.id === interaction.user.id
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
  const now = Date.now();
  if (now - lastPing < pingCooldownMs) return;

  lastPing = now;

  const reminders = readyArray.filter((p) => !p.ready);
  if (reminders.length) {
    const msg = await partyThread.send(reminders.map((p) => p.user).join(' '));

    await msg.delete();
  }
};

export const createConfirmedPlayers = async (
  interaction: ChatInputCommandInteraction
) => {
  const confirmedPlayers: ConfirmedPlayer[] = [];
  const originatingPlayer = {
    user: interaction.user,
    preferences: await getUserPrefs(interaction.user.id),
    nickname: await getNickname(interaction, interaction.user),
  };
  confirmedPlayers.push(originatingPlayer);
  //It's a 2 because I arbitrarily start at p2 because p2 would be the 2nd person in the Dota party
  for (let i = 2; i < 7; i++) {
    const additionalUser = interaction.options.getUser('p' + i);
    if (additionalUser) {
      if (confirmedPlayers.some((cP) => cP.user.id === additionalUser.id)) {
        return;
      }
      const additionalPlayer = {
        user: additionalUser,
        preferences: await getUserPrefs(additionalUser.id),
        nickname: await getNickname(interaction, additionalUser),
      };
      confirmedPlayers.push(additionalPlayer);
    }
  }
  return confirmedPlayers;
};
