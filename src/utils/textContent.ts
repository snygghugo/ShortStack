import { Collection, ButtonInteraction } from 'discord.js';
import { readyOptions } from './consts';

export const botMessages = {
  rolePrefTitle: 'Your Dota 2 Role Preferences',
  rolePrefFieldTitle:
    'Please click the reactions below to indicate your role preferences',
  rolePrefFieldValue: 'Please select your most preferred role',
};

export const roleCallEmbedStrings = {
  open: `${`\`\`Open slot\`\``}`,
  dotaQuery: "*Who's up for Dota?*",
  condiHeading: '*Conditionally In*',
};

export const readyEmbedStrings = {
  readyHeading: '**R E A D Y  C H E C K**',
  blank: '\u200b',
};

export const inOutButLabels = {
  joinLabel: "I'M IN",
  leaveLabel: "I'M OUT",
  dummyLabel: 'Dummy',
  condiLabel: "I'm in, but (...)",
};

export const rdyButtonsLabels = {
  rdyLabel: '✅',
  stopLabel: 'Cancel',
  sudoLabel: 'FORCE READY',
  pingLabel: 'Ping!',
};

export const lfsSetUpStrings = {
  setUpMessageContent: (roleCall: string, time: number) =>
    `Calling all ${roleCall}! Closes <t:${time}:R>`,
  outOfTime: 'Looks like you ran out of time, darlings!',
};

export const readyCheckerStrings = {
  partyMessageContent: (time: number) => `Ready check closes <t:${time}:R>`,
  failedMessageContent: (readyTime: number, reCheckTime: number) =>
    `Ready check failed after ${readyTime} seconds. Option to Re-Check closes <t:${reCheckTime}:R>`,
  stoppedMessageContent: (stopper: string, reCheckTime: number) =>
    `${stopper} stopped the ready check. Option to Re-Check closes <t:${reCheckTime}:R>`,
  finalMessageContent: (collected: Collection<string, ButtonInteraction>) => {
    switch (collected.last()?.customId) {
      case readyOptions.sudo:
        const readyLast = collected.last()?.member?.toString();
        return `${readyLast} used FORCED READY! You should be safe to stack, if not blame ${readyLast}`;
      case readyOptions.rdy:
      case readyOptions.ping: //in freak cases "ping" can be the last one
        return "Everyone's ready!";
    }
  },
};
