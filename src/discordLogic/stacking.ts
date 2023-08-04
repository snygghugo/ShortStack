//Consistency in playerArray/updatedArray/objectArray

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  ChatInputCommandInteraction,
  TextChannel,
  Message,
  BaseInteraction,
  GuildMember,
  StringSelectMenuInteraction,
  ButtonInteraction,
  User,
} from 'discord.js';
import Canvas from '@napi-rs/canvas';
import { PlayerObject } from '../commands/splack';
import { getHandle, getSettings } from '../utils/utilities';
import { request } from 'undici';
import { shuffle } from '../utils/utilities';

interface NextUp extends PlayerObject {
  fillFlag: boolean;
}

const getAppropriateChannel = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction
): Promise<TextChannel> => {
  if (!interaction.guildId) throw new Error('GuildId Issues');
  if (!interaction.channel?.id) throw new Error('ChannelID issues');
  const settings = await getSettings();
  let whereToPost = interaction.guild?.channels.cache.get(
    interaction.channel?.id
  );
  const yaposChannel = settings[interaction.guildId]?.yaposChannel;
  if (yaposChannel) {
    whereToPost = interaction.guild?.channels.cache.get(yaposChannel);
  }
  return whereToPost as TextChannel;
};

// module.exports = {
export const stackSetup = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  playerArray: PlayerObject[],
  pickTime: number
) => {
  interaction.deferReply();
  if (!interaction.guildId) throw new Error('GuildId Issues');
  interaction.deleteReply();
  const channel = await getAppropriateChannel(interaction);
  const message = await channel.send('Setting up the beauty...');
  message.startThread({
    name: `🍹${interaction.user.username}'s Pre-Game Lounge 🍹`,
    autoArchiveDuration: 60,
    reason: 'Time for stack!',
  });
  stackExecute(playerArray, message, pickTime, interaction);
};
// };

const updateArray = async (
  playerArray: PlayerObject[],
  recentlyPicked: PlayerObject | undefined
) => {
  if (!recentlyPicked) return playerArray;
  const updatedArray: PlayerObject[] = [];
  for (let player of playerArray) {
    if (player.user !== recentlyPicked.user) {
      updatedArray.push(player);
      continue;
    }
    if (!recentlyPicked.position.startsWith('pos')) {
      updatedArray.push(recentlyPicked);
      continue;
    }
    const { body } = await request(
      player.user.displayAvatarURL({ extension: 'jpg' })
    );
    const avatar = await body.arrayBuffer();
    recentlyPicked.avatar = avatar;
    updatedArray.push(recentlyPicked);
  }
  return updatedArray;
};

async function stackExecute(
  playerArray: PlayerObject[],
  message: Message<true>,
  pickTime: number,
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  recentlyPicked?: PlayerObject
) {
  const updatedArray = await updateArray(playerArray, recentlyPicked);
  const available = availableRoles(updatedArray);
  const nextUp = whosNext(updatedArray);
  const buttonRows = rowBoat(nextUp, available);
  const embed = await prettyEmbed(updatedArray, nextUp, interaction);

  if (!nextUp) {
    await message.edit({
      content: '',
      embeds: [embed.embed],
      files: [embed.file],
      components: [],
    });
    return;
  }

  const assignedRole = appropriateRole(available, nextUp);
  const time = getTimestampInSeconds();
  const spaghettiTime = -1; //HURRY UP

  await message.edit({
    content: `${nextUp.user.toString()} You're up! If you do not pick you will be assigned ${assignedRole} in <t:${
      time + pickTime + spaghettiTime
    }:R>`,
    embeds: [embed.embed],
    components: buttonRows,
    files: [embed.file],
  });

  const filter = (i: BaseInteraction) => i.channel?.id === message.channel.id;
  const collector = message.channel.createMessageComponentCollector({
    filter,
    time: pickTime * 1000,
    max: 1,
  });
  collector.on('collect', async i => {
    console.log(
      `${i.user.username} clicked ${i.customId} for ${
        nextUp.user instanceof User
          ? nextUp.user.username
          : nextUp.user.user.username
      }`
    );
    await i.deferReply();
    await i.deleteReply();
  });

  collector.on('end', async collected => {
    try {
      const last = collected.last();
      if (!last?.customId) {
        console.log(`Autopicked picked ${assignedRole} for ${nextUp.user}`);
        const recentlyPicked = {
          user: nextUp.user,
          handle: getHandle(nextUp.user),
          position: assignedRole,
          preferences: nextUp.preferences,
          avatar: nextUp.avatar,
          randomed: nextUp.randomed,
        };
        stackExecute(
          updatedArray,
          message,
          pickTime,
          interaction,
          recentlyPicked
        );
        return;
      }
      if (last.customId !== 'random') {
        const recentlyPicked = {
          user: nextUp.user,
          handle: getHandle(nextUp.user),
          position: last.customId,
          preferences: nextUp.preferences,
          avatar: nextUp.avatar,
          randomed: nextUp.randomed,
        };
        stackExecute(
          updatedArray,
          message,
          pickTime,
          interaction,
          recentlyPicked
        );
        return;
      }
      const unpickedRoles = [...available];
      unpickedRoles.push('fill');
      const recentlyPicked = {
        user: nextUp.user,
        handle: getHandle(nextUp.user),
        position: shuffle(unpickedRoles)[0],
        preferences: nextUp.preferences,
        avatar: nextUp.avatar,
        randomed: nextUp.randomed + 1,
      };
      stackExecute(
        updatedArray,
        message,
        pickTime,
        interaction,
        recentlyPicked
      );
      return;
    } catch (error) {
      message.edit('There was an error baby  ' + error);
      console.log(error);
    }
  });
}

async function prettyEmbed(
  playerArray: PlayerObject[],
  nextUp: NextUp | null,
  interaction: ChatInputCommandInteraction | ButtonInteraction
) {
  const playerFields: string[] = [];
  playerArray.forEach(async player => {
    const member = await interaction.guild?.members.fetch(player.user.id);
    if (!member) throw new Error('Issues making a member!');
    playerFields.push(stringPrettifier(player, member));
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
}

function whosNext(playerArray: PlayerObject[]): NextUp | null {
  const unpickedPlayer = playerArray.find(player =>
    player.position.startsWith('Has')
  );
  if (unpickedPlayer) return Object.assign({ fillFlag: false }, unpickedPlayer);
  //THIS WAY OF COPYING MIGHT GET FUCKED
  const reversedArray = [...playerArray].reverse();
  const filledPlayer = reversedArray.find(player => player.position === 'fill');
  if (filledPlayer) return Object.assign({ fillFlag: true }, filledPlayer);
  return null;
}

const userToMember = async (
  player: PlayerObject,
  interaction: ChatInputCommandInteraction
) => {
  return await interaction.guild?.members.fetch(player.user.id);
};

//ALL OF THIS MAYBE REDONE SO THAT IT WORKS WITH NICKNAMES?
function stringPrettifier(player: PlayerObject, member: GuildMember) {
  //39 is the max character count to include a max level length + all the pos stuff
  const optimalStringLength = 39;
  const name = member.nickname || member.user.username;
  const playerName = name.slice(0, 20);
  const neededFilling =
    optimalStringLength - (playerName.length + player.position.length);
  const stringFilling = ' '.repeat(neededFilling + 1 - player.randomed);
  const interrobangs = '⁉️'.repeat(player.randomed);
  return `\`\`${playerName}${stringFilling} ${player.position}${interrobangs}\`\``;
}

async function artTime(playerArray: PlayerObject[]) {
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
}

function rowBoat(
  nextUp: NextUp | null,
  available: string[]
): ActionRowBuilder<ButtonBuilder>[] {
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
}

function finalMessageMaker(playerArray: PlayerObject[]) {
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
}

function appropriateRole(available: string[], nextUp: NextUp) {
  const foundPreference = nextUp.preferences.find(preference =>
    available.includes(preference)
  );
  if (foundPreference) return foundPreference;
  if (!nextUp.fillFlag) {
    return 'fill';
  }
  return shuffle(available)[0];
}

function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function availableRoles(playerArray: PlayerObject[]) {
  const standardRoles = ['pos1', 'pos2', 'pos3', 'pos4', 'pos5'];
  for (let object of playerArray) {
    if (object.position.startsWith('pos')) {
      standardRoles.splice(standardRoles.indexOf(object.position), 1);
    }
  }
  return standardRoles;
}

//Definierar en variabel som är en anonym funktion som gör att skrivs "rita(25, 32" så kommer det funka
//const rita = (x, y) => context.drawImage(avatar, x, y, 50, 50);
