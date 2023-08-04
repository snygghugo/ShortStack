import { botMessages } from './textContent';
import {
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  ChatInputCommandInteraction,
  ButtonInteraction,
  AttachmentBuilder,
} from 'discord.js';
import { getHandle } from './generalUtilities';
import { NextUp, PlayerObject } from './types';
import Canvas from '@napi-rs/canvas';

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

export const prettyEmbed = async (
  playerArray: PlayerObject[],
  nextUp: NextUp | null,
  interaction: ChatInputCommandInteraction | ButtonInteraction
) => {
  const playerFields: string[] = [];
  playerArray.forEach(async player => {
    const member = await interaction.guild?.members.fetch(player.user.id);
    if (!member) throw new Error('Issues making a member!');
    playerFields.push(stringPrettifier(player));
  });
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

//ALL OF THIS MAYBE REDONE SO THAT IT WORKS WITH NICKNAMES?
export const stringPrettifier = (player: PlayerObject) => {
  //removing  member?: GuildMember as an argument
  //39 is the max character count to include a max level length + all the pos stuff
  const optimalStringLength = 39;
  const name = getHandle(player.user);
  const playerName = name.slice(0, 20);
  const neededFilling =
    optimalStringLength - (playerName.length + player.position.length);
  const stringFilling = ' '.repeat(neededFilling + 1 - player.randomed);
  const interrobangs = '⁉️'.repeat(player.randomed);
  return `\`\`${playerName}${stringFilling} ${player.position}${interrobangs}\`\``;
};

export const stringPrettifierForYapos = (string: string) => {
  const optimalStringLength = 39;
  const neededFilling = optimalStringLength - string.length;
  const stringFilling = ' '.repeat(neededFilling + 1);
  // const stringFilling = '\u200b'.repeat(neededFilling + 1);

  return `${string}${stringFilling}`;
};

export const modalComponent = (reasonInput: TextInputBuilder) => {
  return new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
};

export const createButton = (
  btnId: string,
  btnText: string,
  btnStyle: ButtonStyle = ButtonStyle.Secondary
) =>
  new ButtonBuilder().setCustomId(btnId).setLabel(btnText).setStyle(btnStyle);

export const createButtonRow = (
  btnText: string,
  btnId: string,
  btnStyle: ButtonStyle = ButtonStyle.Secondary
) => {
  const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
    createButton(btnId, btnText, btnStyle)
  );
  return button;
};

// export const linkButton = (thread: ThreadChannel, label: string) => {
//   const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
//     new ButtonBuilder()
//       .setURL(`https://discord.com/channels/${thread.guild.id}/${thread.id}`)
//       .setLabel(label)
//       .setStyle(ButtonStyle.Link)
//   );
//   return buttonRow;
// };

export const createRoleRows = (
  nextUp: NextUp | null,
  available: string[]
): ActionRowBuilder<ButtonBuilder>[] => {
  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('pos1')
        .setLabel('1️⃣')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!available.includes('pos1'))
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId('pos2')
        .setLabel('2️⃣')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!available.includes('pos2'))
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId('pos3')
        .setLabel('3️⃣')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!available.includes('pos3'))
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId('pos4')
        .setLabel('4️⃣')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!available.includes('pos4'))
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId('pos5')
        .setLabel('5️⃣')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(!available.includes('pos5'))
    );
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
  //Wtf
  return [row1, row2] as ActionRowBuilder<ButtonBuilder>[];
};

export const finalMessageMaker = (playerArray: PlayerObject[]) => {
  const copyCodeCommand = [
    '/splack',
    ...playerArray.map((player, i) => `p${i + 1}:${player.user.toString()}`),
  ];
  const finalArray = playerArray.map(player => {
    if (player.randomed > 0) {
      return `${getHandle(player.user)} ${player.position.slice(
        3
      )}${'⁉️'.repeat(player.randomed)}`;
    }
    return `${getHandle(player.user)} ${player.position.slice(3)}`;
  });
  return {
    finalMessage: finalArray.join(' | '),
    shortCommand: copyCodeCommand.join(' '),
  };
};

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

export const prefEmbedMaker = (chosenRoles?: string[]) => {
  let fieldTitle = botMessages.rolePrefFieldTitle;
  if (chosenRoles?.length === 5) {
    fieldTitle = 'This is your preference: ';
  }

  const valueField = chosenRoles?.join(' > ') || botMessages.rolePrefFieldValue;
  const embed = {
    color: 0x0099ff,
    title: botMessages.rolePrefTitle,
    //    url: 'https://discord.js.org',
    //author: {
    //  name: 'Some name',
    //  icon_url: 'https://i.imgur.com/AfFp7pu.png',
    //  url: 'https://discord.js.org',
    //},
    //description: 'Some description here',
    //thumbnail: {
    //  url: 'https://i.imgur.com/AfFp7pu.png',
    //},
    fields: [
      //{
      //  name: '\u200b',
      //  value: '\u200b',
      //  inline: false,
      //},
      {
        name: fieldTitle,
        value: valueField,
        inline: true,
      },
    ],
    //image: {
    //  url: 'https://i.imgur.com/AfFp7pu.png',
    //},
    //timestamp: new Date().toISOString(),
    //footer: {
    //  text: 'Some footer text here',
    //  icon_url: 'https://i.imgur.com/AfFp7pu.png',
    //},
  };

  return embed;
};
