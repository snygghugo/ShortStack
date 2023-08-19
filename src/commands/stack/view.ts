import { ActionRowBuilder, ButtonBuilder, ButtonStyle, User } from 'discord.js';
import Canvas from '@napi-rs/canvas';
import { request } from 'undici';
import { PlayerObject } from '../../utils/types';
import { BLANK } from '../../utils/textContent';
import { BLANK_FIELD_INLINE } from '../../utils/consts';

const artTime = async (
  playerArray: PlayerObject[],
  oldCanvas?: Canvas.Canvas
) => {
  const positionsMap = new Map([
    ['pos1', { x: 235 - 10, y: 248 - 20 }],
    ['pos2', { x: 125 - 10, y: 125 + 8 }],
    ['pos3', { x: 10 + 15, y: 25 + 43 }],
    ['pos4', { x: 100 - 5, y: 40 + 10 }],
    ['pos5', { x: 185 - 30, y: 248 - 50 }],
  ]);
  const radius = 25;
  const playerToDraw = playerArray.find(({ artTarget }) => artTarget);
  if (oldCanvas) {
    if (!playerToDraw) return oldCanvas;
    const coordinatesToDraw = positionsMap.get(playerToDraw?.position);
    if (!coordinatesToDraw) return oldCanvas;

    const { body } = await request(
      playerToDraw.user.displayAvatarURL({ extension: 'jpg' })
    );
    const playerAvatar = await body.arrayBuffer();
    const avatar = await Canvas.loadImage(playerAvatar);
    const { x, y } = coordinatesToDraw;
    const context = oldCanvas.getContext('2d');
    context.drawImage(avatar, x, y, radius * 2, radius * 2);
    playerToDraw.artTarget = false;
    return oldCanvas;
  }

  const newCanvas = Canvas.createCanvas(308, 308);
  const context = newCanvas.getContext('2d');
  const background = await Canvas.loadImage('./map.png');
  context.drawImage(background, 0, 0, newCanvas.width, newCanvas.height);
  context.beginPath();

  positionsMap.forEach(({ x, y }) => {
    context.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
    context.closePath();
  });
  context.clip();
  return newCanvas;
};

const finalMessageMaker = (playerArray: PlayerObject[]) => {
  const dummiesFiltered = playerArray.filter(
    ({ user }) => !('isDummy' in user)
  );
  const [{ user }, ...rest] = dummiesFiltered;
  const copyCodeCommand = [
    `/stack p1:${user}`,
    ...rest.map(({ user }, i) => `${' '.repeat(7)}p${i + 2}:${user}`),
  ];
  let shortCommand = `\`\`\`${copyCodeCommand.join('\n')}\`\`\``;
  if (copyCodeCommand.length < 5) {
    shortCommand +=
      '\n 👆 Note: The Absentee players are not included and need to be added to the command manually!\n';
  }
  const sortedArray = [...playerArray].sort(
    (a, b) => parseInt(a.position.slice(3)) - parseInt(b.position.slice(3))
  );
  const finalArray = sortedArray.map(player => {
    return `${player.nickname} ${player.position.slice(3)}${'⁉️'.repeat(
      player.randomed
    )}`;
  });
  return {
    finalMessage: finalArray.join(' | '),
    shortCommand,
  };
};

const prettifyString = ({ nickname, position, randomed }: PlayerObject) => {
  const posAndRandom = position + '!?'.repeat(randomed);
  if (position === '👈') {
    return `\`${nickname}${posAndRandom
      .padEnd(17)
      .padStart(41 - nickname.length)}\``;
  }
  return `\`${nickname}${posAndRandom.padStart(41 - nickname.length)}\``;
};

export const stackEmbed = async (
  playerArray: PlayerObject[],
  nextUp: PlayerObject | null,
  oldCanvas?: Canvas.Canvas
) => {
  const nameField = playerArray
    .map(({ user }) => {
      if (user instanceof User) {
        return user;
      }
      return user.username;
    })
    .join('\n');
  const mobileField = playerArray.map(prettifyString);
  const positionField = playerArray
    .map(({ position, randomed }) => `${position}${'!?'.repeat(randomed)}`)
    .join('\n');
  const newCanvas = await artTime(playerArray, oldCanvas);
  if (nextUp) {
    const embed = {
      fields: [
        {
          name: 'Picking order:',
          // value: `${mobileField.join('\n')}`,
          value: nameField,
          inline: true,
        },
        BLANK_FIELD_INLINE,
        { name: BLANK, value: positionField, inline: true },
      ],
      image: {
        url: 'attachment://dota-map.png',
      },
    };
    return { embed, newCanvas };
  }

  const { finalMessage, shortCommand } = finalMessageMaker(playerArray);
  const embed = {
    fields: [
      { name: 'Re-/stack Command Code:', value: shortCommand },
      {
        name: 'Picking complete!',
        // value: `${mobileField.join('\n')}`,
        value: nameField,
        inline: true,
      },
      { name: BLANK, value: positionField, inline: true },
    ],
    image: {
      url: 'attachment://dota-map.png',
    },
    footer: { text: finalMessage },
  };
  return { embed, newCanvas };
};
const createRoleButton = (
  id: string,
  label: string,
  available: string[],
  style: ButtonStyle = ButtonStyle.Secondary
) =>
  new ButtonBuilder()
    .setCustomId(id)
    .setLabel(label)
    .setStyle(style)
    .setDisabled(!available.includes(id));

export const createRoleRows = (
  nextUp: PlayerObject | null,
  available: string[]
): ActionRowBuilder<ButtonBuilder>[] => {
  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(createRoleButton('pos1', '1️⃣', available))
    .addComponents(createRoleButton('pos2', '2️⃣', available))
    .addComponents(createRoleButton('pos3', '3️⃣', available))
    .addComponents(createRoleButton('pos4', '4️⃣', available))
    .addComponents(createRoleButton('pos5', '5️⃣', available));
  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('fill')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('935684531023925299')
        .setDisabled(nextUp?.fillFlag)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId('random')
        .setLabel('⁉️')
        .setStyle(ButtonStyle.Primary)
    );
  return [row1, row2];
};
