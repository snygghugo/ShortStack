import {
  ActionRowBuilder,
  AttachmentBuilder,
  ChatInputCommandInteraction,
  ButtonInteraction,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import Canvas from '@napi-rs/canvas';
import { PlayerObject, NextUp } from '../../utils/types';

const artTime = async (playerArray: PlayerObject[]) => {
  const canvas = Canvas.createCanvas(308, 308);
  const context = canvas.getContext('2d');
  const background = await Canvas.loadImage('./map.png');
  context.drawImage(background, 0, 0, canvas.width, canvas.height);
  context.beginPath();
  const positionsPositionsArray = [
    { x: 235 - 10, y: 248 - 20 },
    { x: 125, y: 125 },
    { x: 10, y: 25 },
    { x: 100, y: 40 },
    { x: 185 - 10, y: 248 - 20 },
  ];
  positionsPositionsArray.forEach(({ x, y }) => {
    const radius = 25;
    context.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
    context.closePath();
  });
  context.clip();
  for (let player of playerArray) {
    if (player.avatar) {
      if (player.position.startsWith('pos')) {
        const avatar = await Canvas.loadImage(player.avatar);
        const draw = ({ x, y }: { x: number; y: number }) =>
          context.drawImage(avatar, x, y, 50, 50);
        switch (player.position) {
          case 'pos1':
            draw(positionsPositionsArray[0]);
            break;
          case 'pos2':
            draw(positionsPositionsArray[1]);
            break;
          case 'pos3':
            draw(positionsPositionsArray[2]);
            break;
          case 'pos4':
            draw(positionsPositionsArray[3]);
            break;
          case 'pos5':
            draw(positionsPositionsArray[4]);
            break;
        }
      }
    }
  }
  return new AttachmentBuilder(await canvas.encode('png'), {
    name: 'dota-map.png',
  });
};

const finalMessageMaker = (playerArray: PlayerObject[]) => {
  const copyCodeCommand = [
    '/stack',
    ...playerArray
      .filter(({ user }) => !('isDummy' in user))
      .map(({ user }, i) => `p${i + 1}:${user}`),
  ];
  const finalArray = playerArray.map(player => {
    if (player.randomed > 0) {
      return `${player.user.username} ${player.position.slice(3)}${'⁉️'.repeat(
        player.randomed
      )}`;
    }
    return `${player.user.username} ${player.position.slice(3)}`;
  });
  return {
    finalMessage: finalArray.join(' | '),
    shortCommand: copyCodeCommand.join(' '),
  };
};

export const stackEmbed = async (
  playerArray: PlayerObject[],
  nextUp: NextUp | null,
  interaction: ChatInputCommandInteraction | ButtonInteraction
) => {
  // const playerFields: string[] = [];
  const playerFields = playerArray.map(player => stringPrettifier(player));
  // playerArray.forEach(async player => {
  //   playerFields.push(stringPrettifier(player));
  // });
  const art = await artTime(playerArray);
  if (nextUp) {
    const embed = {
      color: (Math.random() * 0xffffff) << 0,
      fields: [{ name: 'Picking order: ', value: playerFields.join('\n') }],
      image: {
        url: 'attachment://dota-map.png',
      },
    };
    const embedObject = { embed: embed, file: art };
    return embedObject;
  }
  const finalText = finalMessageMaker(playerArray);
  const finalMessage = { text: finalText.finalMessage };
  const shortCommand = '`' + finalText.shortCommand + '`';
  const embed = {
    color: (Math.random() * 0xffffff) << 0,
    fields: [
      { name: 'Copy Code:', value: shortCommand },
      { name: 'Picking complete!', value: playerFields.join('\n') },
    ],
    image: {
      url: 'attachment://dota-map.png',
    },
    footer: finalMessage,
  };
  const embedObject = { embed: embed, file: art };
  return embedObject;
};

const stringPrettifier = (player: PlayerObject) => {
  //39 is the max character count to include a max level length + all the pos stuff
  const optimalStringLength = 39;
  const name = player.user.username;
  const playerName = name.slice(0, 20);
  const neededFilling =
    optimalStringLength - (playerName.length + player.position.length);
  const stringFilling = ' '.repeat(neededFilling + 1 - player.randomed);
  const interrobangs = '⁉️'.repeat(player.randomed);
  return `\`\`${playerName}${stringFilling} ${player.position}${interrobangs}\`\``;
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
  const row1 = new ActionRowBuilder()
    .addComponents(createRoleButton('pos1', '1️⃣', available))
    .addComponents(createRoleButton('pos2', '2️⃣', available))
    .addComponents(createRoleButton('pos3', '3️⃣', available))
    .addComponents(createRoleButton('pos4', '4️⃣', available))
    .addComponents(createRoleButton('pos5', '5️⃣', available));
  //5 buttons/row is max for Discord, so I'm splitting them in half :)
  const row2 = new ActionRowBuilder()
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
  return [row1, row2] as ActionRowBuilder<ButtonBuilder>[];
};
