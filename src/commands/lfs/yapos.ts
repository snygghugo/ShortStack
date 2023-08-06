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
} from 'discord.js';
import {
  removeFromArray,
  getTimestamp,
  handleIt,
  forceReady,
  everyoneReady,
  pingMessage,
  createDummy,
} from './utilities';
import { createButtonRow, modalComponent } from '../../utils/view';
import { readyEmbed, roleCallEmbed, inOutBut, rdyButtons } from './view';
import { stackSetup } from '../stack/stacking';
import { ConditionalPlayer, ConfirmedPlayer, Dummy } from '../../utils/types';
import { shuffle, getNickname } from '../../utils/generalUtilities';
import {
  getDotaRole,
  getChannelFromSettings,
  getSettings,
  getPreferences,
} from '../../database/db';
import {
  ONEHOUR,
  buttonOptions,
  readyOptions,
  READYTIME,
  FIVEMINUTES,
  standardTime,
} from '../../utils/consts';
import { lfsSetUpStrings, readyCheckerStrings } from '../../utils/textContent';

// const invokeQueue = async (interaction: Interaction) => { //BELOW WE NEED THE QUEUE FOR THIS TO WORK
//   const queuer = { id: interaction.user.toString() };
//   const queue = await helpMeLittleHelper(queuer, 'get');
//   queue.data.forEach(async (invokee) => {
//     await helpMeLittleHelper({ id: invokee }, 'delete');
//   });
//   return queue.data;
// };

// const messageMaker = async (interaction: ChatInputCommandInteraction) => {
//   const time = getTimestamp(1000);
//   let initMessage = `${yapos} call, closes <t:${time + ONEHOUR}:R>`;
//   //let initMessage = `FAKE yapos call, closes when it crashes`; //Use for testing purposes
//   const queue = await invokeQueue(interaction);
//   if (queue) {
//     initMessage += `\nFor your interest ${queue.join(' & ')}`;
//   }
//   return initMessage;
// };

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
  const roleCall = await getDotaRole(interaction.guildId);
  const { setUpMessageContent: setUpMessageContent, outOfTime } =
    lfsSetUpStrings;
  // messageContent = await messageMaker(interaction); REMAKE THIS GUY ONCE QUEUE IS FIGURED OUT
  const time = getTimestamp(1000);

  const setUpMessage = {
    content: setUpMessageContent(roleCall, time + ONEHOUR), //this will later be messageContent
    embeds: [roleCallEmbed(confirmedPlayers, condiPlayers)],
    components: inOutBut(),
  };

  const dotaChannel = await getChannelFromSettings(interaction, 'dota');
  const dotaMessage = await dotaChannel.send(setUpMessage);
  if (!dotaMessage) throw new Error("Couldn't set up new Dota Message");
  const partyThread = await pThreadCreator(interaction, dotaMessage);
  const confirmedPlayersWithoutDummies = confirmedPlayers.filter(
    (p): p is { player: User; nickname: string } => !('isDummy' in p)
  );
  confirmedPlayersWithoutDummies.forEach(p =>
    partyThread.members.add(p.player)
  );
  if (confirmedPlayers.length > 4) {
    //CHECK IF THIS IS WHERE THE BUG IS? CONSOLE LOG THAT FUCKER OUT OF ORBIT
    //it's not here :/
    // ljudGöraren.ljudGöraren(userToMember(confirmedPlayers, interaction));
    console.log(
      'Now I am right before running the ready checker in the confirmedPlayers.length condition'
    );
    readyChecker(confirmedPlayers, dotaMessage, partyThread);
    return;
  }

  const filter = (i: CollectedMessageInteraction) =>
    i.customId in buttonOptions && i.message.id === dotaMessage.id;
  const collector = dotaMessage.channel.createMessageComponentCollector({
    filter,
    time: ONEHOUR * 1000,
    componentType: ComponentType.Button,
  });
  console.log('setUp: on collect');
  collector.on('collect', async i => {
    console.log(`${i.user.username} clicked ${i.customId}`);
    switch (i.customId) {
      case buttonOptions.in:
        if (
          !confirmedPlayers.find(({ player }) => {
            console.log('Comparing this id', player.id);
            console.log('With this', interaction.user.id);
            return player.id === interaction.user.id;
          })
        ) {
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

      case buttonOptions.condi:
        if (
          !condiPlayers.find(({ player }) => {
            console.log('Comparing this id', player.id);
            console.log('With this', interaction.user.id);
            return player.id === interaction.user.id;
          })
        ) {
          removeFromArray(confirmedPlayers, i); //remove player from IN if they're in it
          await modalThing(i, condiPlayers, confirmedPlayers);
        }
        break;

      case buttonOptions.dummy:
        // let dummyCollection = interaction.guild?.members.cache.filter(
        //   dummy =>
        //     dummy.user.bot && !confirmedPlayers.find(d => d.player == dummy)
        // );
        // //FETCH MORE IF THE DUMMY COLLECTION IS SHORT
        // if (!dummyCollection)
        //   throw new Error(
        //     'The dummy array was unable to be created from cache!'
        //   );
        // if ([...dummyCollection].length < 5) {
        //   dummyCollection = (await interaction.guild?.members.fetch())?.filter(
        //     dummy =>
        //       dummy.user.bot && !confirmedPlayers.find(d => d.player == dummy)
        //   );
        //   if (!dummyCollection)
        //     throw new Error(
        //       'The dummy array was unable to be created from fetch!'
        //     );
        // }
        // const dummyArray = [...dummyCollection?.values()];
        // const [dummy] = shuffle(dummyArray);
        // if (dummy) {
        const modalInteraction = await getDummyNameModal(i);
        if (!modalInteraction) {
          console.log('For some reason modalinteraction was falsy');
          break;
        }
        if (!modalInteraction.isFromMessage())
          throw new Error('Somehow modalInteraction is not from message');
        const dummyName =
          modalInteraction.fields.getTextInputValue('dummyName') || 'Ghost';

        if (!dummyName) break;
        const dummy = createDummy(dummyName);
        confirmedPlayers.push({ player: dummy, nickname: dummyName });
        await modalInteraction.update({
          embeds: [roleCallEmbed(confirmedPlayers, condiPlayers)],
        });
        if (confirmedPlayers.length > 4) {
          console.log(
            "That's enough! Stopping the collector from within the dummy array stuff"
          );
          collector.stop(
            "That's enough! Stopping the collector from within the dummy array stuff"
          );
          // }
        }
        break;

      case buttonOptions.out:
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
    } else {
      //Time for a ready check
      // const memberArray = userToMember(confirmedPlayers, interaction);
      // ljudGöraren.ljudGöraren(memberArray);
      console.log(
        'Finishing and starting the ready checker from the ELSE block of the component collector'
      );
      readyChecker(confirmedPlayers, dotaMessage, partyThread);
    }
  });
};

async function readyChecker(
  confirmedPlayers: ConfirmedPlayer[],
  partyMessage: Message<true>,
  partyThread: AnyThreadChannel
) {
  const {
    partyMessageContent,
    failedMessageContent,
    stoppedMessageContent,
    finalMessageContent,
  } = readyCheckerStrings;
  // const readyArray: PlayerToReady[] = [];
  const readyArray = confirmedPlayers.map(({ player }) => ({
    gamer: player,
    ready: false,
    pickTime: 0,
  }));
  const time = getTimestamp(1000);
  const miliTime = getTimestamp(1);
  // for (let player of confirmedPlayers) {
  //   readyArray.push({ gamer: player.player, ready: false, pickTime: 0 });
  // }
  const filter = (i: CollectedMessageInteraction) =>
    i.message?.id === partyMessage.id && i.customId in readyOptions;
  const collector = partyMessage.channel.createMessageComponentCollector({
    filter,
    time: READYTIME * 1000,
    componentType: ComponentType.Button,
  });
  //THIS GUY IS NEW HERE, HE USED TO BE DOWN BELOW!
  const embed = readyEmbed(readyArray);
  await partyMessage.edit({
    content: partyMessageContent(time + READYTIME),
    embeds: [embed],
    components: rdyButtons(),
  });

  collector.on('collect', async i => {
    const pickTime = getTimestamp(1);
    console.log(i.user.username + ' clicked ' + i.customId);
    switch (i.customId) {
      case readyOptions.rdy:
        const player = readyArray.find(e => {
          return e.gamer.id === i.member?.user.id && e.ready === false;
        });
        if (player) {
          player.ready = true;
          player.pickTime = pickTime - miliTime;
        }
        if (everyoneReady(readyArray)) {
          console.log('Now stopping');
          collector.stop("That's enough");
        }
        break;
      case readyOptions.stop:
        collector.stop('Someone wants out!');
        break;
      case readyOptions.sudo:
        forceReady(readyArray, pickTime, miliTime);
        collector.stop();
        break;
      case readyOptions.ping:
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
    console.log(`Everyone ready ser ut såhär: ${everyoneReady(readyArray)}`);
    if (!everyoneReady(readyArray)) {
      const time = getTimestamp(1000);
      const redoButton = createButtonRow('Re-Check', 'redo');
      switch (collected.last()?.customId) {
        case readyOptions.stop:
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
    } else {
      const stackButton = createButtonRow('Stack it!', 'stack');
      await partyMessage.edit({
        content: finalMessageContent(collected),
        components: [stackButton],
      });
      await stackIt(partyMessage, confirmedPlayers, partyThread);
    }
  });

  // const embed = readyEmbed(readyArray);
  // partyMessage.edit({
  //   content: `Ready check closes <t:${time + READYTIME}:R>`,
  //   embeds: [embed],
  //   components: rdyButtons(),
  // }); gonna try moving this fella up to see what happens
}

async function redoCollector(
  partyMessage: Message<true>,
  confirmedPlayers: ConfirmedPlayer[],
  partyThread: AnyThreadChannel
) {
  const filter = (i: CollectedInteraction) =>
    i.message?.id === partyMessage.id && i.customId === 'redo';
  const collector = partyMessage.channel.createMessageComponentCollector({
    filter,
    time: FIVEMINUTES * 1000,
    max: 1,
    componentType: ComponentType.Button,
  });
  collector.on('collect', async i => await handleIt(i, 'Again!'));
  collector.on('end', async collected => {
    switch (collected.last()?.customId) {
      case 'redo':
        readyChecker(confirmedPlayers, partyMessage, partyThread);
        return;
      default:
        await partyMessage.edit({
          content: 'Ready check failed.',
          components: [],
        });
        break;
    }
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
    i.message?.id === message.id && i.customId === 'stack';
  const collector = message.channel.createMessageComponentCollector({
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
        'It is possible that they are actually ready but the interaction is falsy so who knows'
      );
      await message.edit({
        content: "You actually don't seem all that ready.",
      });
      return;
    }
    let guildHasPreferences = false;
    const settingsObject = await getSettings();
    const { guildId } = interaction;
    if (!guildId) throw new Error('Somehow there is no guildI');
    if (guildId in settingsObject) {
      console.log('There is a guildid in the settings object');
      guildHasPreferences = true;
    }
    const choices = confirmedPlayers.map(({ player, nickname }) => {
      let preferences = ['fill'];
      if (guildHasPreferences) {
        preferences = getPreferences(player, settingsObject, guildId);
      }
      return {
        user: player,
        nickname: nickname,
        position: 'Has not picked yet',
        preferences,
        randomed: 0,
      };
    });
    const shuffledChoices = shuffle(choices);
    // const trashChannel = await getChannelFromSettings(interaction, 'trash');
    // const stackThread = await trashChannel?.threads.create({
    //   name: interaction?.user.username + "'s Dota Party",
    //   autoArchiveDuration: 60,
    //   reason: 'Time for stack!',
    // });
    await stackSetup(interaction, shuffledChoices, standardTime, message);
    // const button = linkButton(stackThread, 'Stack Thread');
    // await message.edit({
    //   content: 'Stack is running in the Stack Thread!',
    //   components: [button],
    // }); THIS GUY IS A LIE, DOES NOTHING ATM
  });
}

export const getDummyNameModal = async (interaction: ButtonInteraction) => {
  //this is  a little busy
  const modal = new ModalBuilder()
    .setCustomId('textCollector')
    .setTitle('Ok, buddy');
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
      filter: i => i.user.id === interaction.user.id,
    })
    .catch(error => {
      console.error(error);
      return null;
    });
  return submitted;
};

// export const dummySystem = async (
//   interaction: ButtonInteraction,
//   condiPlayers: ConditionalPlayer[],
//   confirmedPlayers: ConfirmedPlayer[],
//   dummy: GuildMember
// ) => {
//   //this is  a little busy
//   const modal = new ModalBuilder()
//     .setCustomId('textCollector')
//     .setTitle('Ok, buddy');
//   const avatarInput = new TextInputBuilder()
//     .setCustomId('avatar')
//     .setLabel('Which Dummy is the Dummy representing?')
//     .setPlaceholder('The Dummy this Dummy is representing is...')
//     .setMaxLength(140)
//     .setStyle(TextInputStyle.Short);
//   const modalInput = modalComponent(avatarInput);
//   modal.addComponents(modalInput);
//   await interaction.showModal(modal);
//   const submitted = await interaction
//     .awaitModalSubmit({
//       time: READYTIME * 1000,
//       filter: i => i.user.id === interaction.user.id,
//     })
//     .catch(error => {
//       console.error(error);
//       return null;
//     });
//   if (!submitted) {
//     await interaction.update({
//       embeds: [roleCallEmbed(confirmedPlayers, condiPlayers)],
//     });
//     return;
//   }
//   const representing = ` *avatar of **${submitted.fields.getTextInputValue(
//     'avatar'
//   )}***`;

//   confirmedPlayers.push({
//     player: dummy,
//     representing: representing,
//   });
//   if (!submitted.isFromMessage())
//     throw new Error("Somehow this modal isn't from a message");
// await submitted.update({
//   embeds: [roleCallEmbed(confirmedPlayers, condiPlayers)],
// });
// };

async function modalThing(
  interaction: ButtonInteraction,
  condiPlayers: ConditionalPlayer[],
  confirmedPlayers: ConfirmedPlayer[]
) {
  //this is  a little busy
  const modal = new ModalBuilder()
    .setCustomId('textCollector')
    .setTitle('Ok, buddy');
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
      filter: i => i.user.id === interaction.user.id,
    })
    .catch(error => {
      console.error(error);
      return null;
    });
  if (!submitted) {
    await interaction.update({
      embeds: [roleCallEmbed(confirmedPlayers, condiPlayers)],
    });
    return;
  }
  const time = getTimestamp(1000);
  const condition = `${submitted.fields.getTextInputValue(
    'reason'
  )} *(written <t:${time}:R>)*`;
  const nickname = await getNickname(interaction, interaction.user);
  condiPlayers.push({
    player: interaction.user,
    nickname,
    condition: condition,
  });
  if (!submitted.isFromMessage())
    throw new Error("Somehow this modal isn't from a message");

  await submitted.update({
    embeds: [roleCallEmbed(confirmedPlayers, condiPlayers)],
  });
}
