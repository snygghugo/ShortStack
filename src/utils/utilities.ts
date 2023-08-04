import { ChatInputCommandInteraction, GuildMember, User } from 'discord.js';
import { promises as fs } from 'fs';

export type HugoData = {
  [guild: string]: {
    players: { [player: string]: string[] };
    yaposChannel?: string;
  };
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

export const getSettings = async (): Promise<HugoData> => {
  const settingsObject = JSON.parse(
    await fs.readFile('settings.json', 'utf-8')
  );
  return settingsObject;
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

export const saveYapos = async (
  interaction: ChatInputCommandInteraction,
  channel: string
) => {
  if (!interaction.guildId) throw new Error('Something with guildId');
  const settings = await getSettings();
  if (!(interaction.guildId in settings))
    settings[interaction.guildId] = { players: {} };

  settings[interaction.guildId].yaposChannel = channel;
  await writeSettings(settings);
};

export const savePreferences = async (
  interaction: ChatInputCommandInteraction,
  choices: string[]
) => {
  if (!interaction.guildId) throw new Error('Something with guildId');
  const settings = await getSettings();
  if (!(interaction.guildId in settings)) {
    settings[interaction.guildId] = { players: {} };
  }
  settings[interaction.guildId].players[interaction.user.toString()] = choices;
  await writeSettings(settings);
};

export const tsCompliantIncludes = (array: any[], x: any) => {
  if (!x) return false;
  return array.includes(x);
};

const writeSettings = async (settings: object) => {
  await fs.writeFile('settings.json', JSON.stringify(settings), 'utf-8');
};
