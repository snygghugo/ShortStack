import { User, ButtonStyle } from 'discord.js';

export type PlayerObject = {
  user: User | Dummy;
  nickname: string;
  position: string;
  preferences: string[];
  randomed: number;
  artTarget: boolean;
  fillFlag: boolean;
};
export type ConditionalPlayer = {
  user: User;
  nickname: string;
  preferences: string[];
  condition: string;
};
export type ConfirmedPlayer = {
  user: User | Dummy;
  preferences: string[];
  nickname: string;
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

export type BtnConfig = {
  btnText: string;
  btnId: string;
  btnStyle: ButtonStyle;
};

export type Invokee = {
  id: string;
  hasHeeded: boolean;
};
