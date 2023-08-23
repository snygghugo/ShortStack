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
  lobbyEmbedStrings,
  readyEmbedStrings,
  BLANK,
} from '../../utils/textContent';
import { parsePrefsForEmbed } from '../../utils/generalUtilities';
import { READY_BUTTONS, STACK_BUTTONS } from '../../utils/buttons/buttonConsts';
import { figureItOut } from './roleDistributor';
import { getNameWithPing } from '../../utils/getters';

export const createStackButtons = () => {
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

export const lobbyEmbed = (
  confirmedPlayers: ConfirmedPlayer[],
  condiPlayers: ConditionalPlayer[]
) => {
  const { open, dotaQuery, condiHeading } = lobbyEmbedStrings;
  const roles = figureItOut(confirmedPlayers);
  const undesiredRoles = roles;
  // .filter(
  //   ({ potentialPlayers, restrictedTo }) =>
  //     potentialPlayers.length === 0 && restrictedTo.length === 0
  // );
  // const restrictedRoles = roles.filter(
  //   ({ restrictedTo }) => restrictedTo.length
  // );

  const maxLength = 5;
  const playerFields = [];
  const preferencesFields = [];
  const embedFields = [];

  if (confirmedPlayers.length && undesiredRoles.length !== 5) {
    console.log('These are undesired roles', undesiredRoles);
    embedFields.push(
      {
        name: '**Needed** roles',
        value: undesiredRoles.map(({ role }) => role).join('\n'),
        inline: true,
      },
      // BLANK_FIELD_INLINE,
      // {
      //   name: 'Restricted roles',
      //   value: restrictedRoles
      //     .map(
      //       ({ role, restrictedTo }) =>
      //         `${role}, restricted to ${restrictedTo.join(' & ')}`
      //     )
      //     .join('\n'),
      //   inline: true,
      // },
      BLANK_FIELD
    );
  }

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

  embedFields.push(
    { name: dotaQuery, value: playerFields.join('\n'), inline: true },
    BLANK_FIELD_INLINE,
    {
      name: '*Preferences*',
      value: preferencesFields.join('\n'),
      inline: true,
    }
  );

  if (condiPlayers.length > 0) {
    const conditionalFields = condiPlayers.map(
      ({ user, condition }) => `${user} - ${condition}`
    );
    embedFields.push(BLANK_FIELD);
    embedFields.push({
      name: condiHeading,
      value: conditionalFields.join('\n'),
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
          .map(({ user }) => getNameWithPing(user).toString())
          .join('\n'),
        inline: true,
      },
      BLANK_FIELD_INLINE,
      {
        name: BLANK,
        value: readyArray
          .map(({ ready, pickTime }) =>
            ready ? `✅ \`readied in ${pickTime / 1000}\`` : '❌'
          )
          .join('\n'),
        inline: true,
      },
    ],
  };
  return embed;
};
