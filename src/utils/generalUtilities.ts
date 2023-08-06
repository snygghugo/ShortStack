import {
  User,
  ChatInputCommandInteraction,
  ButtonInteraction,
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
  if (user instanceof User) {
    return (
      (await interaction.guild?.members.fetch(user.id))?.nickname ||
      user.username
    );
  }
  return user.username;
};
