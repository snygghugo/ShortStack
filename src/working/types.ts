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
