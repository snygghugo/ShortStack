import { botMessages } from './textContent';

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
