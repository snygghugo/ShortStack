import {
  ConfirmedPlayer,
  ConditionalPlayer,
  PlayerToReady,
} from '../../utils/types';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { readyColours } from '../../utils/consts';
import { createButton } from '../../utils/view';

export const inOutBut = () => {
  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(createButton('in', "I'M IN", ButtonStyle.Success))
    .addComponents(createButton('out', "I'M OUT", ButtonStyle.Danger));

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(createButton('dummy', 'Dummy', ButtonStyle.Primary))
    .addComponents(createButton('condi', "I'm in, but (...)"));
  return [row1, row2];
};

export const rdyButtons = () => {
  const buttonRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(createButton('rdy', '✅', ButtonStyle.Success))
    .addComponents(createButton('stop', 'Cancel', ButtonStyle.Danger));
  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(createButton('sudo', 'FORCE READY', ButtonStyle.Primary))
    .addComponents(createButton('ping', 'Ping'));
  return [buttonRow, row2];
};

export const roleCallEmbed = (
  confirmedPlayers: ConfirmedPlayer[],
  condiPlayers: ConditionalPlayer[]
) => {
  const maxLength = 5;
  const playerFields = [];
  const conditionalFields: string[] = [];
  const embedFields = [];
  for (let i = 0; i < maxLength; i++) {
    if (confirmedPlayers[i]) {
      playerFields.push(
        confirmedPlayers[i].player.toString() +
          (confirmedPlayers[i].representing || '')
      );
    } else {
      playerFields.push(`${`\`\`Open slot\`\``}`);
    }
  }
  embedFields.push({
    name: "*Who's up for Dota?*",
    value: playerFields.join('\n'),
  });

  if (condiPlayers.length > 0) {
    condiPlayers.map(e => {
      conditionalFields.push(`${e.player} ${e.condition}`);
    });
    embedFields.push({
      name: '*Conditionally In*',
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
  const readyAmount = readyArray.filter(({ ready }) => ready).length;
  const embed = {
    color: readyColours[readyAmount as keyof typeof readyColours],
    fields: [
      {
        name: '**R E A D Y  C H E C K**',
        value: readyArray.map(({ gamer }) => gamer.toString()).join('\n'),
        inline: true,
      },
      {
        name: '\u200b',
        value: readyArray.map(({ ready }) => (ready ? '✅' : '❌')).join('\n'),
        inline: true,
      },
    ],
  };
  return embed;
};
