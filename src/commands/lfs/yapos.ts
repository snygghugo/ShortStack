import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChatInputCommandInteraction,
  CollectedInteraction,
  CollectedMessageInteraction,
  Message,
  AnyThreadChannel,
  ButtonInteraction,
  ComponentType,
  User,
  ButtonStyle,
} from 'discord.js';
import {
  removeFromArray,
  getTimestamp,
  forceReady,
  everyoneReady,
  pingMessage,
  createDummy,
} from './utilities';
import { createButtonRow, modalComponent } from '../../utils/view';
import { readyEmbed, roleCallEmbed, inOutBut, rdyButtons } from './view';
import { stackSetup } from '../stack/stacking';
import {
  ConditionalPlayer,
  ConfirmedPlayer,
  PlayerObject,
} from '../../utils/types';
import { shuffle, getNickname, getChannel } from '../../utils/generalUtilities';
import { getGuildFromDb, getUserPrefs } from '../../database/db';
import {
  ONEHOUR,
  READYTIME,
  FIVEMINUTES,
  STANDARD_TIME,
} from '../../utils/consts';
import { lfsSetUpStrings, readyCheckerStrings } from '../../utils/textContent';
import {
  READY_BUTTONS,
  REDO_BUTTON,
  STACK_BUTTONS,
  STACK_IT_BUTTON,
} from '../../utils/buttons/buttonConsts';

export const createConfirmedPlayers = async (
  interaction: ChatInputCommandInteraction
) => {
  const confirmedPlayers: ConfirmedPlayer[] = [];
  confirmedPlayers.push({
    player: interaction.user,
    nickname: await getNickname(interaction, interaction.user),
  });
  //It's a 2 because I arbitrarily start at p2 because p2 would be the 2nd person in the Dota party
  for (let i = 2; i < 7; i++) {
    const player = interaction.options.getUser('p' + i);
    if (player) {
      if (confirmedPlayers.some(cP => cP.player.id === player.id)) {
        return;
      }
      const nickname = await getNickname(interaction, player);
      confirmedPlayers.push({ player, nickname });
    }
  }
  return confirmedPlayers;
};

export const setUp = async (
  interaction: ChatInputCommandInteraction,
  confirmedPlayers: ConfirmedPlayer[]
) => {
  if (!interaction.guildId)
    throw new Error('Somehow there is a lacking GuildId in setUp!');
  const condiPlayers: ConditionalPlayer[] = [];
  const guildSettings = await getGuildFromDb(interaction.guildId);
  const roleCall = guildSettings.yaposRole
    ? `<@&${guildSettings.yaposRole}>`
    : 'Dota Lovers';
  const { setUpMessageContent: setUpMessageContent, outOfTime } =
    lfsSetUpStrings;
  const time = getTimestamp(1000);
  let timeLimit = ONEHOUR;
  const optionalTime = interaction.options.getInteger('timelimit');
  if (optionalTime) {
    timeLimit = optionalTime * 60;
  }
  const setUpMessage = {
    content: setUpMessageContent(
      roleCall,
      time + timeLimit,
      guildSettings.queue
    ), //this will later be messageContent
    embeds: [roleCallEmbed(confirmedPlayers, condiPlayers)],
    components: inOutBut(),
  };
  const dotaChannel = await getChannel(guildSettings.yaposChannel, interaction);
  const dotaMessage = await dotaChannel.send(setUpMessage);
  if (!dotaMessage) throw new Error("Couldn't set up new Dota Message");
  guildSettings.queue = [];
  await guildSettings.save();
  const partyThread = await pThreadCreator(interaction, dotaMessage);
  const confirmedPlayersWithoutDummies = confirmedPlayers.filter(
    (p): p is { player: User; nickname: string } => !('isDummy' in p)
  );
  confirmedPlayersWithoutDummies.forEach(p =>
    partyThread.members.add(p.player)
  );
  const filter = (i: CollectedMessageInteraction) =>
    i.customId in STACK_BUTTONS && i.message.id === dotaMessage.id;
  const collector = dotaMessage.createMessageComponentCollector({
    filter,
    time: timeLimit * 1000,
    componentType: ComponentType.Button,
  });
  console.log('setUp: on collect');
  collector.on('collect', async i => {
    console.log(`${i.user.username} clicked ${i.customId}`);
    switch (i.customId) {
      case STACK_BUTTONS.join.btnId:
        if (!confirmedPlayers.some(({ player }) => player.id === i.user.id)) {
          removeFromArray(condiPlayers, i);
          const nickname = await getNickname(i, i.user);
          confirmedPlayers.push({ player: i.user, nickname });
          await partyThread.members.add(i.user);
          if (confirmedPlayers.length > 4) {
            console.log(
              "That's enough! Stopping the collector from within the case buttonOptions.in"
            );
            collector.stop(
              "That's enough! Collector is stopped from the switch case buttonOptions.in"
            );
          }
        }
        break;

      case STACK_BUTTONS.condi.btnId:
        if (!condiPlayers.some(({ player }) => player.id === i.user.id)) {
          const modalInteraction = await modalThing(
            i,
            condiPlayers,
            confirmedPlayers
          );
          if (!modalInteraction) {
            console.log(
              'falsy modal interaction, likely from opening and cancelling the modal'
            );
            break;
          }
          if (!modalInteraction.isFromMessage())
            throw new Error("Somehow this modal isn't from a message");
          const time = getTimestamp(1000);
          const condition = `${modalInteraction.fields.getTextInputValue(
            'reason'
          )} *(written <t:${time}:R>)*`;
          const nickname = await getNickname(interaction, interaction.user);
          condiPlayers.push({
            player: interaction.user,
            nickname,
            condition: condition,
          });
          removeFromArray(confirmedPlayers, i);
          await modalInteraction.update({
            embeds: [roleCallEmbed(confirmedPlayers, condiPlayers)],
          });
        }
        break;

      case STACK_BUTTONS.dummy.btnId:
        const modalInteraction = await getDummyNameModal(i);
        if (!modalInteraction) {
          console.log(
            'falsy modal interaction, likely from opening and closing the modal without input',
            modalInteraction
          );
          break;
        }
        if (!modalInteraction.isFromMessage())
          throw new Error('Somehow modalInteraction is not from message');
        const dummyName =
          modalInteraction.fields.getTextInputValue('dummyName');
        if (!dummyName) break;
        const dummy = createDummy(dummyName);
        confirmedPlayers.push({ player: dummy, nickname: dummyName });
        await modalInteraction.update({
          embeds: [roleCallEmbed(confirmedPlayers, condiPlayers)],
        });
        if (confirmedPlayers.length === 5) {
          console.log(
            "That's enough! Stopping the collector from within the dummy array stuff"
          );
          collector.stop(
            "That's enough! Stopping the collector from within the dummy array stuff"
          );
        }
        break;

      case STACK_BUTTONS.leave.btnId:
        removeFromArray(condiPlayers, i);
        removeFromArray(confirmedPlayers, i);
        break;
    }
    if (!i.replied) {
      await i.update({
        embeds: [roleCallEmbed(confirmedPlayers, condiPlayers)],
      });
    }
  });

  console.log('setUp: on end');
  collector.on('end', async () => {
    if (confirmedPlayers.length < 5) {
      await dotaMessage.edit({
        content: outOfTime,
        components: [],
      });
      return;
    }
    console.log(
      'Finishing and starting the ready checker from the ELSE block of the component collector'
    );
    await dotaMessage.edit({
      content: 'Setting up ready check...',
      components: [],
      embeds: [],
    });
    readyChecker(confirmedPlayers, dotaMessage, partyThread);
  });
};

const readyChecker = async (
  confirmedPlayers: ConfirmedPlayer[],
  partyMessage: Message<true>,
  partyThread: AnyThreadChannel
) => {
  console.log('now we are in the ready checker');
  const {
    partyMessageContent,
    failedMessageContent,
    stoppedMessageContent,
    finalMessageContent,
  } = readyCheckerStrings;
  const readyArray = confirmedPlayers.map(({ player }) => ({
    gamer: player,
    ready: false,
    pickTime: 0,
  }));
  const time = getTimestamp(1000);
  const miliTime = getTimestamp(1);
  const filter = (i: CollectedMessageInteraction) =>
    i.customId in READY_BUTTONS;
  const collector = partyMessage.createMessageComponentCollector({
    filter,
    time: READYTIME * 1000,
    componentType: ComponentType.Button,
  });
  const embed = readyEmbed(readyArray);
  console.log('right before the edit fires off');
  await partyMessage.edit({
    content: partyMessageContent(time + READYTIME),
    embeds: [embed],
    components: rdyButtons(),
  });
  console.log('this is after the edit');
  collector.on('collect', async i => {
    const pickTime = getTimestamp(1);
    console.log(i.user.username + ' clicked ' + i.customId);
    switch (i.customId) {
      case READY_BUTTONS.rdy.btnId:
        const player = readyArray.find(
          e => e.gamer.id === i.user.id && e.ready === false
        );
        if (player) {
          player.ready = true;
          player.pickTime = pickTime - miliTime;
        }
        if (everyoneReady(readyArray)) {
          console.log('Now stopping');
          collector.stop("That's enough");
        }
        break;
      case READY_BUTTONS.stop.btnId:
        collector.stop('Someone wants out!');
        break;
      case READY_BUTTONS.sudo.btnId:
        forceReady(readyArray, pickTime - miliTime);
        collector.stop();
        break;
      case READY_BUTTONS.ping.btnId:
        await i.deferReply();
        pingMessage(readyArray, partyThread);
        await i.deleteReply();
        break;
    }
    if (!i.deferred) {
      await i.update({
        embeds: [readyEmbed(readyArray)],
      });
    }
  });

  collector.on('end', async collected => {
    console.log(
      `Now stopping and removing components, the final interaction was: ${
        collected.last() ? collected.last()?.customId : `Nothing!`
      }`
    );
    await partyMessage.edit({
      components: [],
      embeds: [readyEmbed(readyArray)],
    });
    if (!everyoneReady(readyArray)) {
      const time = getTimestamp(1000);
      const redoButton = createButtonRow(REDO_BUTTON);
      switch (collected.last()?.customId) {
        case READY_BUTTONS.stop.btnId:
          const stopper = collected.last()?.member?.toString() || 'Someone';
          await partyMessage.edit({
            content: stoppedMessageContent(stopper, time + FIVEMINUTES),
            components: [redoButton],
          });
          await redoCollector(partyMessage, confirmedPlayers, partyThread);
          return;

        default:
          await partyMessage.edit({
            content: failedMessageContent(READYTIME, time + FIVEMINUTES),
            components: [redoButton],
          });
          await redoCollector(partyMessage, confirmedPlayers, partyThread);
          return;
      }
    }

    console.log('this is the else block before the stack button is made');
    const stackButton = createButtonRow(STACK_IT_BUTTON);
    await partyMessage.edit({
      content: finalMessageContent(collected),
      components: [stackButton],
    });
    await stackIt(partyMessage, confirmedPlayers, partyThread);
  });
};

async function redoCollector(
  partyMessage: Message<true>,
  confirmedPlayers: ConfirmedPlayer[],
  partyThread: AnyThreadChannel
) {
  const filter = (i: CollectedInteraction) =>
    i.message?.id === partyMessage.id && i.customId === REDO_BUTTON.btnId;
  const collector = partyMessage.createMessageComponentCollector({
    filter,
    time: FIVEMINUTES * 1000,
    max: 1,
    componentType: ComponentType.Button,
  });
  collector.on('collect', async i => {
    await i.update('Again!');
  });
  collector.on('end', async collected => {
    if (collector.endReason === 'time') {
      console.log('endreason was time');
      await partyMessage.edit({
        content: 'Ready check failed.',
        components: [],
      });
      return;
    }
    console.log(
      'endreason was something other than time, next code should fire off without issue'
    );
    readyChecker(confirmedPlayers, partyMessage, partyThread);
    return;
  });
}
const pThreadCreator = async (
  interaction: ChatInputCommandInteraction,
  dotaMessage: Message
) => {
  const partyThread = await dotaMessage.startThread({
    name: `🍹${interaction.user.username}'s Pre-Game Lounge 🍹`,
    autoArchiveDuration: 60,
    reason: 'Time for stack!',
  });
  return partyThread;
};

async function stackIt(
  message: Message<true>,
  confirmedPlayers: ConfirmedPlayer[],
  partyThread?: AnyThreadChannel
) {
  const filter = (i: CollectedInteraction) =>
    i.message?.id === message.id && i.customId === STACK_IT_BUTTON.btnId;
  const collector = message.createMessageComponentCollector({
    filter,
    time: FIVEMINUTES * 1000,
    max: 1,
    componentType: ComponentType.Button,
  });
  collector.on('collect', async i => {});

  collector.on('end', async collected => {
    // Gör ljud när du stackar
    // ljudGöraren.ljudGöraren(
    //   userToMember(confirmedPlayers, message),
    //   (shouldWeStackIt = true)
    // );
    await message.edit({ components: [] });
    const interaction = collected.last();
    if (!interaction) {
      console.log(
        'It is possible that they are actually ready but the interaction is falsy so who knows',
        interaction,
        collected
      );

      await message.edit({
        content: "You actually don't seem all that ready.",
      });
      return;
    }

    const playerArray: PlayerObject[] = [];

    for (let { player, nickname } of confirmedPlayers) {
      const preferences = await getUserPrefs(player.id);
      playerArray.push({
        user: player,
        nickname: nickname,
        position: '',
        preferences,
        artTarget: false,
        fillFlag: false,
        randomed: 0,
      });
    }
    const shuffledPlayerArray = shuffle(playerArray);
    await stackSetup(interaction, shuffledPlayerArray, STANDARD_TIME, message);
  });
}

export const getDummyNameModal = async (interaction: ButtonInteraction) => {
  //this is  a little busy
  const uniqueId = Date.now().toString();
  const modal = new ModalBuilder().setCustomId(uniqueId).setTitle('Ok, buddy');
  const avatarInput = new TextInputBuilder()
    .setCustomId('dummyName')
    .setLabel('Who are you adding?')
    .setPlaceholder('This spot is meant to represent...')
    .setMaxLength(14)
    .setStyle(TextInputStyle.Short);
  const modalInput = modalComponent(avatarInput);
  modal.addComponents(modalInput);
  await interaction.showModal(modal);
  const submitted = await interaction
    .awaitModalSubmit({
      time: READYTIME * 1000,
      filter: i => i.user.id === interaction.user.id && i.customId === uniqueId,
    })
    .catch(error => {
      console.log('This is inside the modal error thing');
      console.error(error);
      return null;
    });
  return submitted;
};

async function modalThing(
  interaction: ButtonInteraction,
  condiPlayers: ConditionalPlayer[],
  confirmedPlayers: ConfirmedPlayer[]
) {
  //this is  a little busy
  const uniqueId = Date.now().toString();
  const modal = new ModalBuilder().setCustomId(uniqueId).setTitle('Ok, buddy');
  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel("What's the holdup? Include ETA")
    .setPlaceholder("Describe what's stopping you from being IN RIGHT NOW")
    .setMaxLength(140)
    .setStyle(TextInputStyle.Short);
  const modalInput = modalComponent(reasonInput);
  modal.addComponents(modalInput);
  await interaction.showModal(modal);
  const submitted = await interaction
    .awaitModalSubmit({
      time: READYTIME * 1000,
      filter: i => i.user.id === interaction.user.id && i.customId === uniqueId,
    })
    .catch(error => {
      console.error(error);
      return null;
    });
  return submitted;
}
