import { ChatInputCommandInteraction, GuildMember, User } from 'discord.js';
import { promises as fs } from 'fs';

export type HugoData = {
  [guild: string]: {
    players: { [player: string]: string[] };
    yaposChannel?: string;
    trashChannel?: string;
    yaposRole?: string;
  };
};

export type SettingsOptions = {
  stacks?: string;
  role?: string;
  trash?: string;
};

export function shuffle([...array]) {
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
}

export const getHandle = (player: User | GuildMember) => {
  if (player instanceof User) {
    return player.username;
  }
  return player.nickname || player.user.username;
};

export const getPreferences = (
  user: User | GuildMember,
  settingsObject: HugoData,
  guildId: string
) => {
  if (user.toString() in settingsObject[guildId].players) {
    const preferences = settingsObject[guildId].players[user.toString()];
    console.log(`${getHandle(user)} has preferences ${preferences}!`);
    return preferences;
  }
  console.log('User does not have preferences, returning fill');
  return ['fill'];
};

export const tsCompliantIncludes = (array: any[], x: any) => {
  if (!x) return false;
  return array.includes(x);
};
