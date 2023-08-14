import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import {
  ConfirmedPlayer,
  ConditionalPlayer,
  PlayerToReady,
} from '../../utils/types';
import { READY_COLOURS } from '../../utils/consts';
import { createButton } from '../../utils/view';
import {
  roleCallEmbedStrings,
  readyEmbedStrings,
  BLANK,
} from '../../utils/textContent';
import { getNameWithPing } from '../../utils/generalUtilities';
import { READY_BUTTONS, STACK_BUTTONS } from '../../utils/buttons/buttonConsts';

export const inOutBut = () => {
  const { join, leave, dummy, condi } = STACK_BUTTONS;
  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(createButton(join))
    .addComponents(createButton(leave));

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(createButton(dummy))
    .addComponents(createButton(condi));
  return [row1, row2];
};

export const rdyButtons = () => {
  const { rdy, stop, sudo, ping } = READY_BUTTONS;
  const buttonRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(createButton(rdy))
    .addComponents(createButton(stop));
  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(createButton(sudo))
    .addComponents(createButton(ping));
  return [buttonRow, row2];
};

export const roleCallEmbed = (
  confirmedPlayers: ConfirmedPlayer[],
  condiPlayers: ConditionalPlayer[]
) => {
  const { open, dotaQuery, condiHeading } = roleCallEmbedStrings;
  const maxLength = 5;
  const playerFields = [];
  const conditionalFields: string[] = [];
  const embedFields = [];
  for (let i = 0; i < maxLength; i++) {
    if (confirmedPlayers[i]) {
      playerFields.push(getNameWithPing(confirmedPlayers[i].player).toString());
    } else {
      playerFields.push(open);
    }
  }
  embedFields.push({
    name: dotaQuery,
    value: playerFields.join('\n'),
  });

  if (condiPlayers.length > 0) {
    condiPlayers.map(e => {
      conditionalFields.push(`${e.player} ${e.condition}`);
    });
    embedFields.push({
      name: condiHeading,
      value: conditionalFields.join('\n'),
    });
  }

  const embed = {
    color: READY_COLOURS[confirmedPlayers.length as keyof typeof READY_COLOURS],
    fields: embedFields,
  };
  return embed;
};

export const readyEmbed = (readyArray: PlayerToReady[]) => {
  const { readyHeading } = readyEmbedStrings;
  const readyAmount = readyArray.filter(({ ready }) => ready).length;
  const embed = {
    color: READY_COLOURS[readyAmount as keyof typeof READY_COLOURS],
    fields: [
      {
        name: readyHeading,
        value: readyArray
          .map(({ gamer }) => getNameWithPing(gamer).toString())
          .join('\n'),
        inline: true,
      },
      {
        name: BLANK,
        value: readyArray.map(({ ready }) => (ready ? '✅' : '❌')).join('\n'),
        inline: true,
      },
    ],
  };
  return embed;
};
