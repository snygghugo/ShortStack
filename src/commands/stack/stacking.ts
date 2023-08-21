import {
  ChatInputCommandInteraction,
  Message,
  ButtonInteraction,
  ComponentType,
  AttachmentBuilder,
  CollectedInteraction,
} from 'discord.js';
import { PlayerObject } from '../../utils/types';
import { shuffle, pThreadCreator } from '../../utils/generalUtilities';
import { getGuildFromDb } from '../../database/db';
import { createRoleRows, stackEmbed } from './view';
import { Canvas } from '@napi-rs/canvas';
import {
  appropriateRole,
  availableRoles,
  getTimestampInSeconds,
  strictPicking,
  whosNext,
} from './utilities';
import { getGuildId, getChannel, getNameWithPing } from '../../utils/getters';

export const stackSetup = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  playerArray: PlayerObject[],
  pickTime: number,
  oldMessage?: Message<true>
) => {
  interaction.deferReply();
  const guildId = getGuildId(interaction);
  const guildSettings = await getGuildFromDb(guildId);
  const isStrictPicking = guildSettings.strictPicking;
  const channel = await getChannel(guildSettings.yaposChannel, interaction);
  const message = oldMessage || (await channel.send('Setting up shop...'));
  if (!oldMessage) {
    await pThreadCreator(interaction, message);
  }
  await interaction.deleteReply();
  stackExecute(playerArray, message, pickTime, interaction, isStrictPicking);
};

const stackExecute = async (
  playerArray: PlayerObject[],
  message: Message<true>,
  pickTime: number,
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  isStrictPicking: boolean,
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
    content: `**YOUR TURN TO PICK ${getNameWithPing(
      nextUp.user
    )}!**\nIf you do not pick you will be assigned ${assignedRole} in <t:${
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
    componentType: ComponentType.Button,
  });

  collector.on('collect', async i => {
    console.log(
      `${i.user.username} clicked ${i.customId} for ${nextUp.user.username}`
    );
    if (isStrictPicking) {
      const isAppropriateInteraction = strictPicking(i, nextUp, interaction);
      if (!isAppropriateInteraction) {
        await i.reply({
          content: "It's not your turn to pick yet!",
          ephemeral: true,
        });
        return;
      }
    }

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
    await i.update('Thinking...'); //MAKE A CUTE ARRAY FOR THIS, WITH RANDOM PHRASES
    collector.stop();
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
      stackExecute(
        playerArray,
        message,
        pickTime,
        interaction,
        isStrictPicking,
        newCanvas
      );
      return;
    } catch (error) {
      message.edit('There was an error, baby!  ' + error);
      console.log(error);
    }
  });
};
