import { botMessages } from './textContent';
import {
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
  TextInputBuilder,
} from 'discord.js';

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

export const prefEmbedMaker = (chosenRoles?: string[]) => {
  let fieldTitle = botMessages.rolePrefFieldTitle;
  if (chosenRoles?.length === 5) {
    fieldTitle = 'This is your preference: ';
  }

  const valueField = chosenRoles?.join(' > ') || botMessages.rolePrefFieldValue;
  const embed = {
    color: 0x0099ff,
    title: botMessages.rolePrefTitle,
    fields: [
      {
        name: fieldTitle,
        value: valueField,
        inline: true,
      },
    ],
  };

  return embed;
};
