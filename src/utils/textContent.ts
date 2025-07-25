import { Collection, ButtonInteraction } from 'discord.js';
import { READY_BUTTONS } from './buttons/buttonConsts';

export const botMessages = {
  rolePrefTitle: 'Your Dota 2 Role Preferences',
  rolePrefFieldTitle:
    'Use the buttons to indicate your preferences, from most to least preferred role',
  rolePrefFieldValue: 'Please select your most preferred role',
};

export const lobbyEmbedStrings = {
  open: `${`\`\`Open slot\`\``}`,
  dotaQuery: "*Who's up for Dota?*",
  condiHeading: '*Conditionally In*',
};

export const BLANK = '\u200b';

export const readyEmbedStrings = {
  readyHeading: '**R E A D Y  C H E C K**',
};

export const lfsSetUpStrings = {
  setUpMessageContent: (roleCall: string, time: number, queue: string[]) => {
    let messageContent = `Calling all ${roleCall}! Closes <t:${time}:R>`;
    if (queue.length) {
      messageContent += `\n${queue
        .map((id) => `<@${id}>`)
        .join(' & ')} for your consideration`;
    }
    return messageContent;
  },
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
      case READY_BUTTONS.sudo.btnId:
        const readyLast = collected.last()?.member?.toString();
        return `${readyLast} used FORCED READY! You should be safe to stack, if not blame ${readyLast}`;
      case READY_BUTTONS.rdy.btnId:
      case READY_BUTTONS.ping.btnId: //in freak cases "ping" can be the last one
        return "Everyone's ready!";
    }
  },
};
