import { User, GuildMember } from 'discord.js';

export type PlayerObject = {
  user: User | Dummy;
  handle: string;
  position: string;
  preferences: string[];
  randomed: number;
  avatar?: ArrayBuffer;
};

export interface NextUp extends PlayerObject {
  fillFlag: boolean;
}
export type ConditionalPlayer = { player: User; condition: string };
export type ConfirmedPlayer = {
  player: User | Dummy;
};

export type Dummy = {
  name: string;
  id: string;
  username: string;
  user: { username: string };
  displayAvatarURL: () => string;
  isDummy: boolean;
};

export type PlayerToReady = {
  gamer: User | Dummy;
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
