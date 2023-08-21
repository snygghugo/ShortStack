import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  ChannelType,
} from 'discord.js';
import { User } from 'discord.js';
import { Dummy } from './types';

export const getGuildId = (
  interaction: ChatInputCommandInteraction | ButtonInteraction
) => {
  const guildId = interaction.guildId;
  if (!guildId) throw new Error('GuildID is falsy!');
  return guildId;
};

export const getUserFromInteractionOptions = (
  interaction: ChatInputCommandInteraction,
  user: string
) => {
  const userToAdd = interaction.options.getUser(user);
  if (!userToAdd) throw new Error('Unable to find user!');
  return userToAdd;
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

export const getNameWithPing = (user: User | Dummy) => {
  if ('isDummy' in user) {
    return `@${user.id}`;
  }
  return user;
};

export const getNickname = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  user: User | Dummy
) => {
  try {
    if (user instanceof User) {
      const member = await interaction.guild?.members.fetch(user.id);
      return (
        member?.nickname ||
        member?.displayName ||
        user.globalName ||
        user.username
      );
    }
    return user.username;
  } catch (error) {
    console.error(error);
    throw new Error((error as Error).message);
  }
};
