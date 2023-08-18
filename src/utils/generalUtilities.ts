import {
  User,
  ChatInputCommandInteraction,
  ButtonInteraction,
  ChannelType,
} from 'discord.js';
import { Dummy } from './types';

export const shuffle = <Type>(array: Type[]): Type[] => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

export const getNameWithPing = (user: User | Dummy) => {
  if ('isDummy' in user) {
    return `@${user.id}`;
  }
  return user;
};

export const tsCompliantIncludes = (array: any[], x: any) => {
  if (!x) return false;
  return array.includes(x);
};

export const getNickname = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  user: User | Dummy
) => {
  try {
    if (user instanceof User) {
      const member = await interaction.guild?.members.fetch(user.id);
      return member?.nickname || member?.displayName || user.username;
    }
    return user.username;
  } catch (error) {
    console.error(error);
    throw new Error((error as Error).message);
  }
};

export const getChannel = async (
  channelId: string | undefined,
  interaction: ChatInputCommandInteraction | ButtonInteraction
) => {
  if (channelId) {
    const channelToReturn =
      interaction.guild?.channels.cache.get(channelId) ||
      (await interaction.guild?.channels.fetch(channelId)) ||
      interaction.channel;
    if (channelToReturn?.type !== ChannelType.GuildText)
      throw new Error('Channel to return is not correct type');
    return channelToReturn;
  }
  if (interaction.channel?.type !== ChannelType.GuildText)
    throw new Error('Interaction.channel is not correct type');
  return interaction.channel;
};

export const parsePrefsForEmbed = (pos: string) => {
  switch (pos) {
    case 'pos1':
      return '1️⃣';
    case 'pos2':
      return '2️⃣';
    case 'pos3':
      return '3️⃣';
    case 'pos4':
      return '4️⃣';
    case 'pos5':
      return '5️⃣';
    default:
      return 'No /preferences set!';
  }
};
