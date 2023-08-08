//Consistency in playerArray/updatedArray/objectArray

import {
  ChatInputCommandInteraction,
  Message,
  ButtonInteraction,
  ComponentType,
  CollectedInteraction,
} from 'discord.js';
import { request } from 'undici';
import { PlayerObject, NextUp } from '../../utils/types';
import { getNameWithPing, shuffle } from '../../utils/generalUtilities';
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
  const message = oldMessage || (await channel.send('Setting up shop...'));
  if (!oldMessage) {
    await message.startThread({
      name: `🍹${interaction.user.username}'s Pre-Game Lounge 🍹`,
      autoArchiveDuration: 60,
      reason: 'Time for stack!',
    });
  }
  stackExecute(playerArray, message, pickTime, interaction);
};

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
  const { embed, art } = await stackEmbed(updatedArray, nextUp);

  if (!nextUp) {
    await message.edit({
      content: 'All done!',
      embeds: [embed],
      files: [art],
      components: [],
    });
    return;
  }

  const assignedRole = appropriateRole(available, nextUp);
  const time = getTimestampInSeconds();
  const spaghettiTime = -1; //HURRY UP

  await message.edit({
    content: `${getNameWithPing(
      nextUp.user
    )} You're up! If you do not pick you will be assigned ${assignedRole} in <t:${
      time + pickTime + spaghettiTime
    }:R>`,
    embeds: [embed],
    components: buttonRows,
    files: [art],
  });

  const filter = (i: CollectedInteraction) => i.message?.id === message.id;
  const collector = message.channel.createMessageComponentCollector({
    filter,
    time: pickTime * 1000,
    max: 1,
    componentType: ComponentType.Button,
  });
  collector.on('collect', async i => {
    console.log(
      `${i.user.username} clicked ${i.customId} for ${nextUp.user.username}`
    );
    i.update('Thinking...'); //MAKE A CUTE ARRAY FOR THIS
    // await i.deferReply();
    // await i.deleteReply();
  });

  collector.on('end', async collected => {
    try {
      const last = collected.last();
      if (!last?.customId) {
        console.log(`Autopicked picked ${assignedRole} for ${nextUp.user}`);
        const recentlyPicked = { ...nextUp, position: assignedRole };
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
        const recentlyPicked = { ...nextUp, position: last.customId };
        stackExecute(
          updatedArray,
          message,
          pickTime,
          interaction,
          recentlyPicked
        );
        return;
      }
      const unpickedRoles = [...available, 'fill'];
      const [randomedPosition] = shuffle(unpickedRoles);
      const recentlyPicked = {
        ...nextUp,
        position: randomedPosition,
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
      message.edit('There was an error, baby!  ' + error);
      console.log(error);
    }
  });
}

function whosNext(playerArray: PlayerObject[]): NextUp | null {
  const unpickedPlayer = playerArray.find(player => !player.position);
  if (unpickedPlayer) {
    unpickedPlayer.position = '👈';
    return { ...unpickedPlayer, fillFlag: false };
  }
  const reversedArray = [...playerArray].reverse();
  const filledPlayer = reversedArray.find(player => player.position === 'fill');
  if (filledPlayer) {
    filledPlayer.position = '👈';
    return { ...filledPlayer, fillFlag: true };
  }
  return null;
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
