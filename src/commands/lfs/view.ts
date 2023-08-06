import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import {
  ConfirmedPlayer,
  ConditionalPlayer,
  PlayerToReady,
} from '../../utils/types';
import {
  readyColours,
  rdyButtonsCustomIds,
  stackButtonCustomIds,
} from '../../utils/consts';
import { createButton } from '../../utils/view';
import {
  roleCallEmbedStrings,
  readyEmbedStrings,
  inOutButLabels,
  rdyButtonsLabels,
  BLANK,
} from '../../utils/textContent';
import { getNameWithPing } from '../../utils/generalUtilities';

export const inOutBut = () => {
  const { join, leave, dummy, condi } = stackButtonCustomIds;
  const { joinLabel, leaveLabel, dummyLabel, condiLabel } = inOutButLabels;
  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(createButton(join, joinLabel, ButtonStyle.Success))
    .addComponents(createButton(leave, leaveLabel, ButtonStyle.Danger));

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(createButton(dummy, dummyLabel, ButtonStyle.Primary))
    .addComponents(createButton(condi, condiLabel));
  return [row1, row2];
};

export const rdyButtons = () => {
  const { rdy, stop, sudo, ping } = rdyButtonsCustomIds;
  const { rdyLabel, stopLabel, sudoLabel, pingLabel } = rdyButtonsLabels;
  const buttonRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(createButton(rdy, rdyLabel, ButtonStyle.Success))
    .addComponents(createButton(stop, stopLabel, ButtonStyle.Danger));
  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(createButton(sudo, sudoLabel, ButtonStyle.Primary))
    .addComponents(createButton(ping, pingLabel));
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
    color: readyColours[confirmedPlayers.length as keyof typeof readyColours],
    fields: embedFields,
  };
  return embed;
};

export const readyEmbed = (readyArray: PlayerToReady[]) => {
  const { readyHeading } = readyEmbedStrings;
  const readyAmount = readyArray.filter(({ ready }) => ready).length;
  const embed = {
    color: readyColours[readyAmount as keyof typeof readyColours],
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
