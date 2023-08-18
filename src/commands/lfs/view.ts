import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import {
  ConfirmedPlayer,
  ConditionalPlayer,
  PlayerToReady,
} from '../../utils/types';
import {
  BLANK_FIELD,
  BLANK_FIELD_INLINE,
  READY_COLOURS,
} from '../../utils/consts';
import { createButton } from '../../utils/view';
import {
  roleCallEmbedStrings,
  readyEmbedStrings,
  BLANK,
} from '../../utils/textContent';
import {
  getNameWithPing,
  parsePrefsForEmbed,
} from '../../utils/generalUtilities';
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
  const preferencesFields = [];

  for (let i = 0; i < maxLength; i++) {
    const player = confirmedPlayers[i];
    if (player) {
      playerFields.push(getNameWithPing(player.user).toString());
      preferencesFields.push(
        player.preferences.map(parsePrefsForEmbed).join(' > ')
      );
    } else {
      playerFields.push(open);
    }
  }

  const embedFields = [
    { name: dotaQuery, value: playerFields.join('\n'), inline: true },
    BLANK_FIELD_INLINE,
    {
      name: '*Preferences*',
      value: preferencesFields.join('\n'),
      inline: true,
    },
  ];

  if (condiPlayers.length > 0) {
    const conditionalNames = condiPlayers.map(e => e.user);
    const conditionalConditions = condiPlayers.map(e => e.condition);
    embedFields.push(BLANK_FIELD);
    embedFields.push({
      name: condiHeading,
      value: conditionalNames.join('\n'),
      inline: true,
    });
    embedFields.push(BLANK_FIELD_INLINE);
    embedFields.push({
      name: '*Condition*',
      value: conditionalConditions.join('\n'),
      inline: true,
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
