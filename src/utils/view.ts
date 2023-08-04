import { botMessages } from './textContent';
import {
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
  ThreadChannel,
  TextInputBuilder,
} from 'discord.js';

export const stringPrettifier = (string: string) => {
  const optimalStringLength = 39;
  const neededFilling = optimalStringLength - string.length;
  const stringFilling = '\u200b'.repeat(neededFilling + 1);
  return `${string}${stringFilling}`;
};

export const modalComponent = (reasonInput: TextInputBuilder) => {
  return new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
};

export const createButton = (
  btnText: string,
  btnId: string,
  btnStyle: ButtonStyle = ButtonStyle.Secondary
) =>
  new ButtonBuilder().setCustomId(btnId).setLabel(btnText).setStyle(btnStyle);

export const createButtonRow = (
  btnText: string,
  btnId: string,
  btnStyle: ButtonStyle = ButtonStyle.Secondary
) => {
  const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
    createButton(btnText, btnId, btnStyle)
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
