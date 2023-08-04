import { User, GuildMember } from 'discord.js';

export type ConditionalPlayer = { player: User; condition: string };
export type ConfirmedPlayer = {
  player: User | GuildMember;
  representing?: string;
};
export type PlayerToReady = {
  gamer: User | GuildMember;
  ready: boolean;
  pickTime: number;
};

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
