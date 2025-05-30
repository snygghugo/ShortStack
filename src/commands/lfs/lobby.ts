import {
  AnyThreadChannel,
  ChatInputCommandInteraction,
  CollectedInteraction,
  CollectedMessageInteraction,
  ComponentType,
  Message,
  User,
} from 'discord.js';
import { getGuildFromDb, getUserPrefs } from '../../database/db';
import {
  READY_BUTTONS,
  READY_TO_READY_BUTTON,
  REDO_BUTTON,
  STACK_BUTTONS,
  STACK_IT_BUTTON,
} from '../../utils/buttons/buttonConsts';
import {
  FIVEMINUTES,
  ONEHOUR,
  READYTIME,
  STANDARD_TIME,
} from '../../utils/consts';
import { pThreadCreator, shuffle } from '../../utils/generalUtilities';
import { getGuildId, getChannel, getNickname } from '../../utils/getters';
import { lfsSetUpStrings, readyCheckerStrings } from '../../utils/textContent';
import {
  ConditionalPlayer,
  ConfirmedPlayer,
  PlayerObject,
} from '../../utils/types';
import { createButtonRow } from '../../utils/view';
import { stackSetup } from '../stack/stacking';
import {
  createDummy,
  everyoneReady,
  forceReady,
  getTimestamp,
  pingMessage,
  removeFromArray,
} from './utilities';
import { getDummyNameModal, condiModal } from './modals';
import { createStackButtons, lobbyEmbed, rdyButtons, readyEmbed } from './view';

export const setUp = async (
  interaction: ChatInputCommandInteraction,
  confirmedPlayers: ConfirmedPlayer[]
) => {
  const guildId = getGuildId(interaction);
  const condiPlayers: ConditionalPlayer[] = [];
  const guildSettings = await getGuildFromDb(guildId);
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
    ),
    embeds: [lobbyEmbed(confirmedPlayers, condiPlayers)],
    components: createStackButtons(),
  };
  const dotaChannel = await getChannel(guildSettings.yaposChannel, interaction);
  const dotaMessage = await dotaChannel.send(setUpMessage);
  guildSettings.queue = [];
  await guildSettings.save();
  const partyThread = await pThreadCreator(interaction, dotaMessage);
  const confirmedPlayersWithoutDummies = confirmedPlayers.filter(
    (p): p is { user: User; preferences: string[]; nickname: string } =>
      !('isDummy' in p)
  );
  confirmedPlayersWithoutDummies.forEach((p) =>
    partyThread.members.add(p.user)
  );
  if (confirmedPlayers.length === 5) {
    await dotaMessage.edit({
      embeds: [lobbyEmbed(confirmedPlayers, condiPlayers)],
      components: [createButtonRow(READY_TO_READY_BUTTON)],
    });
  }

  const filter = (i: CollectedMessageInteraction) =>
    (i.customId in STACK_BUTTONS ||
      i.customId === READY_TO_READY_BUTTON.btnId) &&
    i.message.id === dotaMessage.id;
  const collector = dotaMessage.createMessageComponentCollector({
    filter,
    time: timeLimit * 1000,
    componentType: ComponentType.Button,
  });
  console.log('setUp: on collect');
  collector.on('collect', async (i) => {
    console.log(`${i.user.username} clicked ${i.customId}`);
    switch (i.customId) {
      case STACK_BUTTONS.join.btnId:
        if (!confirmedPlayers.some(({ user }) => user.id === i.user.id)) {
          removeFromArray(condiPlayers, i);
          const nickname = await getNickname(i, i.user);
          const preferences = await getUserPrefs(i.user.id);
          confirmedPlayers.push({ user: i.user, preferences, nickname });
          await partyThread.members.add(i.user);
          if (confirmedPlayers.length === 5) {
            await i.update({
              embeds: [lobbyEmbed(confirmedPlayers, condiPlayers)],
              components: [createButtonRow(READY_TO_READY_BUTTON)],
            });
            console.log('Stopping from', STACK_BUTTONS.join.btnId);
          }
        }
        break;

      case STACK_BUTTONS.condi.btnId:
        if (!condiPlayers.some(({ user }) => user.id === i.user.id)) {
          const modalInteraction = await condiModal(i);
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
          const preferences = await getUserPrefs(i.user.id);
          condiPlayers.push({
            user: i.user,
            nickname,
            preferences,
            condition: condition,
          });
          removeFromArray(confirmedPlayers, i);
          await modalInteraction.update({
            embeds: [lobbyEmbed(confirmedPlayers, condiPlayers)],
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
        const dummy = await createDummy(dummyName, i);
        if (
          confirmedPlayers.some(({ user }) => user.id === dummy.user.id) ||
          condiPlayers.some(({ user }) => user.id === dummy.user.id)
        ) {
          await modalInteraction.reply({
            content: `${dummyName} is already accounted for, as ${dummy.nickname}!`,
            ephemeral: true,
          });
          break;
        }
        if (dummy.user instanceof User) {
          await partyThread.members.add(dummy.user);
        }
        confirmedPlayers.push(dummy);
        if (confirmedPlayers.length === 5) {
          console.log('Stopping from withing dummy');
          await modalInteraction.update({
            embeds: [lobbyEmbed(confirmedPlayers, condiPlayers)],
            components: [createButtonRow(READY_TO_READY_BUTTON)],
          });
          break;
        }
        await modalInteraction.update({
          embeds: [lobbyEmbed(confirmedPlayers, condiPlayers)],
        });
        break;

      case STACK_BUTTONS.leave.btnId:
        removeFromArray(condiPlayers, i);
        removeFromArray(confirmedPlayers, i);
        break;

      case READY_TO_READY_BUTTON.btnId:
        collector.stop();
        break;
    }
    if (!i.replied) {
      await i.update({
        embeds: [lobbyEmbed(confirmedPlayers, condiPlayers)],
      });
    }
  });

  console.log('setUp: on end');
  collector.on('end', async () => {
    if (confirmedPlayers.length < 5) {
      await dotaMessage.edit({
        content: outOfTime,
        components: [],
        embeds: [],
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
  const readyArray = confirmedPlayers.map(({ user }) => ({
    user,
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
  collector.on('collect', async (i) => {
    const pickTime = getTimestamp(1);
    console.log(i.user.username + ' clicked ' + i.customId);
    switch (i.customId) {
      case READY_BUTTONS.rdy.btnId:
        const player = readyArray.find(
          (e) => e.user.id === i.user.id && e.ready === false
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
        await i.deferUpdate();
        void pingMessage(readyArray, partyThread);
        break;
    }
    if (!i.deferred) {
      await i.update({
        embeds: [readyEmbed(readyArray)],
      });
    }
  });

  collector.on('end', async (collected) => {
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
    await stackIt(partyMessage, confirmedPlayers);
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
    time: FIVEMINUTES * 3 * 1000,
    max: 1,
    componentType: ComponentType.Button,
  });
  collector.on('collect', async (i) => {
    await i.update('Again!');
    await readyChecker(confirmedPlayers, partyMessage, partyThread);
  });
  collector.on('end', async (collected) => {
    if (collector.endReason === 'time') {
      console.log('endreason was time');
      await partyMessage.edit({
        content: 'Ready check failed.',
        components: [],
      });
      return;
    }
    return;
  });
}

async function stackIt(
  message: Message<true>,
  confirmedPlayers: ConfirmedPlayer[]
) {
  const filter = (i: CollectedInteraction) =>
    i.message?.id === message.id && i.customId === STACK_IT_BUTTON.btnId;
  const collector = message.createMessageComponentCollector({
    filter,
    time: FIVEMINUTES * 1000,
    max: 1,
    componentType: ComponentType.Button,
  });
  collector.on('collect', async (i) => {});

  collector.on('end', async (collected) => {
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

    for (const { user, preferences, nickname } of confirmedPlayers) {
      playerArray.push({
        user,
        nickname,
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
