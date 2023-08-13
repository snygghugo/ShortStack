//Consistency in playerArray/updatedArray/objectArray

import {
  ChatInputCommandInteraction,
  Message,
  ButtonInteraction,
  ComponentType,
  CollectedInteraction,
  AttachmentBuilder,
} from 'discord.js';
import { PlayerObject } from '../../utils/types';
import {
  getChannel,
  getNameWithPing,
  shuffle,
} from '../../utils/generalUtilities';
import { getGuildFromDb } from '../../database/db';
import { createRoleRows, stackEmbed } from './view';
import { Canvas } from '@napi-rs/canvas';

export const stackSetup = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  playerArray: PlayerObject[],
  pickTime: number,
  oldMessage?: Message<true>
) => {
  interaction.deferReply();
  if (!interaction.guildId) throw new Error('GuildId Issues');
  const guildSettings = await getGuildFromDb(interaction.guildId);
  const channel = await getChannel(guildSettings.yaposChannel, interaction);
  // const channel = await getChannelFromSettings(interaction, 'dota');
  const message = oldMessage || (await channel.send('Setting up shop...'));
  if (!oldMessage) {
    await message.startThread({
      name: `🍹${interaction.user.username}'s Pre-Game Lounge 🍹`,
      autoArchiveDuration: 60,
      reason: 'Time for stack!',
    });
  }
  interaction.deleteReply();
  stackExecute(playerArray, message, pickTime, interaction);
};

const stackExecute = async (
  playerArray: PlayerObject[],
  message: Message<true>,
  pickTime: number,
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  oldCanvas?: Canvas
) => {
  const available = availableRoles(playerArray);
  const nextUp = whosNext(playerArray);
  const buttonRows = createRoleRows(nextUp, available);
  const { embed, newCanvas } = await stackEmbed(playerArray, nextUp, oldCanvas);
  const art = new AttachmentBuilder(await newCanvas.encode('png'), {
    name: 'dota-map.png',
  });
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
  nextUp.position = assignedRole;
  nextUp.artTarget = true;

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
    switch (i.customId) {
      case 'random':
        const unpickedRoles = [...available, 'fill'];
        const [randomedPosition] = shuffle(unpickedRoles);
        nextUp.position = randomedPosition;
        nextUp.randomed += 1;
        break;
      default:
        nextUp.position = i.customId;
    }
    i.update('Thinking...'); //MAKE A CUTE ARRAY FOR THIS, WITH RANDOM PHRASES
  });

  collector.on('end', () => {
    try {
      if (collector.endReason === 'time') {
        console.log(
          `Autopicked picked ${assignedRole} for ${nextUp.user.username}`
        );
      }
      if (nextUp.position === 'fill') {
        nextUp.artTarget = false;
      }
      stackExecute(playerArray, message, pickTime, interaction, newCanvas);
      return;
    } catch (error) {
      message.edit('There was an error, baby!  ' + error);
      console.log(error);
    }
  });
};

const whosNext = (playerArray: PlayerObject[]): PlayerObject | null => {
  const unpickedPlayer = playerArray.find(player => !player.position);
  if (unpickedPlayer) {
    unpickedPlayer.position = '👈';
    return unpickedPlayer;
  }
  const filledPlayer = playerArray.findLast(
    player => player.position === 'fill'
  );
  if (filledPlayer) {
    filledPlayer.position = '👈';
    filledPlayer.fillFlag = true;
    return filledPlayer;
  }
  return null;
};

function appropriateRole(available: string[], nextUp: PlayerObject) {
  const foundPreference = nextUp.preferences.find(preference =>
    available.includes(preference)
  );
  if (foundPreference) return foundPreference;
  if (!nextUp.fillFlag) return 'fill';
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
