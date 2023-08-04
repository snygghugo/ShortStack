//Consistency in playerArray/updatedArray/objectArray

import {
  ChatInputCommandInteraction,
  Message,
  BaseInteraction,
  ButtonInteraction,
  User,
} from 'discord.js';
import { request } from 'undici';
import { PlayerObject, NextUp } from '../../utils/types';
import { getHandle, shuffle } from '../../utils/generalUtilities';
import { getChannelFromSettings } from '../../database/db';
import { createRoleRows, stackEmbed } from './view';

export const stackSetup = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  playerArray: PlayerObject[],
  pickTime: number,
  oldMessage?: Message<true>
) => {
  interaction.deferReply();
  if (!interaction.guildId) throw new Error('GuildId Issues');
  interaction.deleteReply();
  const channel = await getChannelFromSettings(interaction, 'dota');
  const message =
    oldMessage || (await channel.send('Setting up the beauty...'));
  if (!oldMessage) {
    await message.startThread({
      name: `🍹${interaction.user.username}'s Pre-Game Lounge 🍹`,
      autoArchiveDuration: 60,
      reason: 'Time for stack!',
    });
  }
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
  const buttonRows = createRoleRows(nextUp, available);
  const embed = await stackEmbed(updatedArray, nextUp, interaction);

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
