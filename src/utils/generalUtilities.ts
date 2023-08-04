import { GuildMember, User } from 'discord.js';

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

export const getHandle = (player: User | GuildMember) => {
  if (player instanceof User) {
    return player.username;
  }
  return player.nickname || player.user.username;
};

export const tsCompliantIncludes = (array: any[], x: any) => {
  if (!x) return false;
  return array.includes(x);
};
