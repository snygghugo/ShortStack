import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  User,
} from 'discord.js';
import Canvas from '@napi-rs/canvas';
import { PlayerObject, NextUp } from '../../utils/types';
import { BLANK } from '../../utils/textContent';

const artTime = async (playerArray: PlayerObject[]) => {
  const canvas = Canvas.createCanvas(308, 308);
  const context = canvas.getContext('2d');
  const background = await Canvas.loadImage('./map.png');
  context.drawImage(background, 0, 0, canvas.width, canvas.height);
  context.beginPath();
  const positionsMap = new Map([
    ['pos1', { x: 235 - 10, y: 248 - 20 }],
    ['pos2', { x: 125, y: 125 }],
    ['pos3', { x: 10, y: 25 }],
    ['pos4', { x: 100, y: 40 }],
    ['pos5', { x: 185 - 10, y: 248 - 20 }],
  ]);
  const radius = 25;
  positionsMap.forEach(({ x, y }) => {
    context.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
    context.closePath();
  });
  context.clip();
  for (let player of playerArray) {
    if (player.avatar) {
      if (positionsMap.has(player.position)) {
        const coordinates = positionsMap.get(player.position);
        if (coordinates) {
          const { x, y } = coordinates;
          const avatar = await Canvas.loadImage(player.avatar);
          context.drawImage(avatar, x, y, radius * 2, radius * 2);
        }
      }
    }
  }
  return new AttachmentBuilder(await canvas.encode('png'), {
    name: 'dota-map.png',
  });
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
  const sortedArray = [...playerArray].sort(
    (a, b) => parseInt(a.position.slice(3)) - parseInt(b.position.slice(3))
  );
  const finalArray = sortedArray.map(player => {
    return `${player.user.username} ${player.position.slice(3)}${'⁉️'.repeat(
      player.randomed
    )}`;
  });
  return {
    finalMessage: finalArray.join(' | '),
    shortCommand: `\`\`\`${copyCodeCommand.join('\n')}\`\`\``,
  };
};

// const createAppropriatePadding = (position: string, randomed: number) => {
//   switch (position) {
//     case 'pos1':
//     case 'pos2':
//     case 'pos3':
//     case 'pos4':
//     case 'pos5':
//     case 'fill':
//       return `${' '.repeat(14 - randomed)}`;
//     case '':
//       return '';
//   }
// };
// const prettyField = (playerObject: PlayerObject) => {
//   const { position, randomed, nickname } = playerObject;
//   const padding = createAppropriatePadding(position, randomed);
//   if (nickname.length > 21) {
//     return `\` ${padding}${position}${'⁉️'.repeat(randomed)}\n${' '.repeat(
//       19
//     )}\``;
//   }
//   return `\` ${padding}${position}${'⁉️'.repeat(randomed)}\``;
// };

export const stackEmbed = async (
  playerArray: PlayerObject[],
  nextUp: NextUp | null
) => {
  const nameField = playerArray
    .map(({ user }) => {
      if (user instanceof User) {
        return user;
      }
      return user.username;
    })
    .join('\n');
  // const positionField = playerArray.map(prettyField).join('\n');

  const prettifyString = ({ nickname, position, randomed }: PlayerObject) => {
    // const goalLength = position !== '👈' ? 38 : 25;
    let goalLength2: number;
    switch (position) {
      case '':
        goalLength2 = 41;
        break;
      case '👈':
        goalLength2 = 43;
        break;
      default:
        goalLength2 = 45;
        break;
    }
    const neededLength =
      goalLength2 - (nickname.length + position.length + randomed);
    return `\`${nickname}${position.padStart(neededLength)}${'⁉️'.repeat(
      randomed
    )}\``;
    // return `${nickname}${position.padStart(neededLength)}${'⁉️'.repeat(
    //   randomed
    // )}`;
  };
  const mobileField = playerArray.map(prettifyString);
  const positionField = playerArray
    .map(({ position, randomed }) => `${position}${'⁉️'.repeat(randomed)}`)
    .join('\n');
  const art = await artTime(playerArray);
  if (nextUp) {
    const embed = {
      fields: [
        {
          name: 'Picking order:',
          value: `${mobileField.join('\n')}`,
          // value: `\`\`\`${mobileField.join('\n')}\`\`\``,
        },
        // { name: 'Picking order:', value: nameField, inline: true },
        // { name: BLANK, value: positionField, inline: true },
      ],
      image: {
        url: 'attachment://dota-map.png',
      },
    };
    // const embedObject = { embed: embed, file: art };
    return { embed, art };
  }

  const { finalMessage, shortCommand } = finalMessageMaker(playerArray);
  // const finalPositionField = playerArray.map(prettyField).join('\n');
  const embed = {
    fields: [
      { name: 'Copy Code:', value: shortCommand },
      {
        name: 'Picking complete!',
        value: `${mobileField.join('\n')}`,
        // value: `\`\`\`${mobileField.join('\n')}\`\`\``,
      },
      // { name: 'Picking complete!', value: nameField, inline: true },
      // { name: BLANK, value: positionField, inline: true },
    ],
    image: {
      url: 'attachment://dota-map.png',
    },
    footer: { text: finalMessage }, //SORT THIS GUY BY POS ASCENDING
  };
  // const embedObject = { embed: embed, file: art };
  return { embed, art };
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
  nextUp: NextUp | null,
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
