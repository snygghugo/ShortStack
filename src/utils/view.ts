import { botMessages } from './textContent';
import { ButtonBuilder, ActionRowBuilder, TextInputBuilder } from 'discord.js';
import { BtnConfig } from './types';

export const modalComponent = (reasonInput: TextInputBuilder) => {
  return new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
};

export const createButton = (btnConfig: BtnConfig) => {
  const { btnText, btnId, btnStyle } = btnConfig;
  return new ButtonBuilder()
    .setCustomId(btnId)
    .setLabel(btnText)
    .setStyle(btnStyle);
};
export const createButtonRow = (btnConfig: BtnConfig) => {
  const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
    createButton(btnConfig)
  );
  return button;
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
