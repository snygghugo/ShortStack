import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  TextChannel,
} from 'discord.js';
import { HugoData, SettingsOptions } from '../utils/utilities';
import { promises as fs } from 'fs';

export const getSettings = async (): Promise<HugoData> => {
  const settingsObject = JSON.parse(
    await fs.readFile('settings.json', 'utf-8')
  );
  return settingsObject;
};

export const getChannelFromSettings = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  type: string
): Promise<TextChannel> => {
  if (!interaction.guildId) throw new Error('GuildId Issues');
  if (!interaction.channel?.id) throw new Error('ChannelID issues');
  const settings = await getSettings();
  let whereToPost = interaction.guild?.channels.cache.get(
    interaction.channel?.id
  );
  switch (type) {
    case 'dota':
      const yaposChannel = settings[interaction.guildId]?.yaposChannel;
      if (yaposChannel) {
        whereToPost = interaction.guild?.channels.cache.get(yaposChannel);
      }
      break;
    case 'trash':
      const trashChannel = settings[interaction.guildId]?.trashChannel;
      if (trashChannel) {
        whereToPost = interaction.guild?.channels.cache.get(trashChannel);
      }
  }

  return whereToPost as TextChannel;
};

export const getDotaRole = async (guildId: string) => {
  const settings = await getSettings();
  if (guildId in settings) {
    if ('yaposRole' in settings[guildId]) {
      return `<@&${settings[guildId].yaposRole}>`;
    }
  }
  return 'Dota lovers!';
};

export const writeSettings = async (settings: HugoData) => {
  await fs.writeFile('settings.json', JSON.stringify(settings), 'utf-8');
};

export const saveSettings = async (
  interaction: ChatInputCommandInteraction,
  options: SettingsOptions
) => {
  const { stacks, role, trash } = options;
  if (!interaction.guildId) throw new Error('Something with guildId');
  const settings = await getSettings();
  if (!(interaction.guildId in settings))
    settings[interaction.guildId] = { players: {} };
  if (stacks) {
    settings[interaction.guildId].yaposChannel = stacks;
  }
  if (role) {
    settings[interaction.guildId].yaposRole = role;
  }
  if (trash) {
    settings[interaction.guildId].trashChannel = trash;
  }

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
