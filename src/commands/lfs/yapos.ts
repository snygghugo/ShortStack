import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChatInputCommandInteraction,
  CollectedInteraction,
  CollectedMessageInteraction,
  Message,
  AnyThreadChannel,
  GuildMember,
  ButtonInteraction,
  Collection,
} from 'discord.js';
import {
  eRemover as removeFromArray,
  getTimestamp,
  handleIt,
  forceReady,
  everyoneReady,
  pingMessage,
  playerIdentityConfirmedPlayer,
  playerIdentityGuildMember,
} from './utilities';
import {
  stringPrettifierForYapos,
  createButtonRow,
  inOutBut,
  rdyButtons,
  modalComponent,
} from '../../utils/view';
import { stackSetup } from '../stack/stacking';
import {
  ConditionalPlayer,
  ConfirmedPlayer,
  PlayerToReady,
} from '../../utils/types';
import { getHandle, shuffle } from '../../utils/generalUtilities';
import {
  getDotaRole,
  getChannelFromSettings,
  getSettings,
  getPreferences,
} from '../../database/db';

const standardTime = 60;
const ONEHOUR = 60 * 60;
const FIVEMINUTES = 5 * 60;
const READYTIME = 2 * 60;
const buttonOptions = { in: 'in', out: 'out', dummy: 'dummy', condi: 'condi' };
const readyOptions = { rdy: 'rdy', stop: 'stop', sudo: 'sudo', ping: 'ping' };

const readyColours = {
  0: 0x000000, //black
  1: 0xcc3300, //red
  2: 0xff9900,
  3: 0xffff00, //yellow
  4: 0xccff33,
  5: 0x99ff33, //green
};

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

export const createConfirmedPlayers = (
  interaction: ChatInputCommandInteraction
) => {
  const confirmedPlayers: ConfirmedPlayer[] = [];
  confirmedPlayers.push({ player: interaction.user });
  //It's a 2 because I arbitrarily start at p2 because p2 would be the 2nd person in the Dota party
  for (let i = 2; i < 7; i++) {
    const player = interaction.options.getUser('p' + i);
    if (player) {
      if (confirmedPlayers.includes({ player: player })) {
        //does this comparison even work? I fiddled with it, I hope it does
        return;
      }
      confirmedPlayers.push({ player: player });
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
  // messageContent = await messageMaker(interaction); REMAKE THIS GUY ONCE QUEUE IS FIGURED OUT
  const time = getTimestamp(1000);

  const messageToSend = {
    content: `Calling all ${roleCall}! Closes <t:${time + ONEHOUR}:R>`, //this will later be messageContent
    embeds: [prettyEmbed(confirmedPlayers, condiPlayers)],
    components: inOutBut(),
  };

  const dotaChannel = await getChannelFromSettings(interaction, 'dota');
  const dotaMessage = await dotaChannel.send(messageToSend);
  if (!dotaMessage) throw new Error("Couldn't set up new Dota Message");
  const partyThread = await pThreadCreator(interaction, dotaMessage);
  confirmedPlayers.forEach(p => partyThread.members.add(p.player));
  if (confirmedPlayers.length > 4) {
    //CHECK IF THIS IS WHERE THE BUG IS? CONSOLE LOG THAT FUCKER OUT OF ORBIT
    // ljudGöraren.ljudGöraren(userToMember(confirmedPlayers, interaction));
    readyChecker(confirmedPlayers, dotaMessage, partyThread);
    return;
  }

  const filter = (i: CollectedMessageInteraction) =>
    i.customId in buttonOptions && i.message.id === dotaMessage.id;
  const collector = dotaMessage.channel.createMessageComponentCollector({
    filter,
    time: ONEHOUR * 1000,
  });
  console.log('setUp: on collect');
  collector.on('collect', async (i: ButtonInteraction) => {
    console.log(`${i.user.username} clicked ${i.customId}`);
    switch (i.customId) {
      case buttonOptions.in:
        if (
          !confirmedPlayers.find(
            playerIdentityConfirmedPlayer(i) || playerIdentityGuildMember(i)
          )
        ) {
          removeFromArray(condiPlayers, i);
          confirmedPlayers.push({ player: i.user });
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
          !condiPlayers.find(
            playerIdentityConfirmedPlayer(i) || playerIdentityGuildMember(i)
          )
        ) {
          removeFromArray(confirmedPlayers, i); //remove player from IN if they're in it
          await modalThing(i, condiPlayers, confirmedPlayers);
        }
        break;

      case buttonOptions.dummy:
        let dummyCollection = interaction.guild?.members.cache.filter(
          dummy =>
            dummy.user.bot &&
            !confirmedPlayers.find((d: ConfirmedPlayer) => d.player == dummy)
        );
        //FETCH MORE IF THE DUMMY COLLECTION IS SHORT
        if (!dummyCollection)
          throw new Error(
            'The dummy array was unable to be created from cache!'
          );
        if ([...dummyCollection].length < 5) {
          console.log('Fetching more dummys');
          dummyCollection = (await interaction.guild?.members.fetch())?.filter(
            dummy =>
              dummy.user.bot &&
              !confirmedPlayers.find((d: ConfirmedPlayer) => d.player == dummy)
          );
          if (!dummyCollection)
            throw new Error(
              'The dummy array was unable to be created from fetch!'
            );
        }
        const dummyArray = [...dummyCollection?.values()];
        const dummy = shuffle(dummyArray)[0];
        if (dummy) {
          await dummySystem(i, condiPlayers, confirmedPlayers, dummy);
          if (confirmedPlayers.length > 4) {
            console.log(
              "That's enough! Stopping the collector from within the dummy array stuff"
            );
            collector.stop(
              "That's enough! Stopping the collector from within the dummy array stuff"
            );
          }
        }
        break;

      case buttonOptions.out:
        removeFromArray(condiPlayers, i);
        removeFromArray(confirmedPlayers, i);
        break;
    }
    if (!i.replied) {
      await i.update({
        embeds: [prettyEmbed(confirmedPlayers, condiPlayers)],
      });
    }
  });

  console.log('setUp: on end');
  collector.on('end', async collected => {
    if (confirmedPlayers.length < 5) {
      await dotaMessage.edit({
        content: 'Looks like you ran out of time, darlings!',
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
  const readyArray: PlayerToReady[] = [];
  const time = getTimestamp(1000);
  const miliTime = getTimestamp(1);
  for (let player of confirmedPlayers) {
    readyArray.push({ gamer: player.player, ready: false, pickTime: 0 });
  }
  const filter = (i: CollectedMessageInteraction) =>
    i.channel?.id === partyMessage.channel.id && i.customId in readyOptions;

  const collector = partyMessage.channel.createMessageComponentCollector({
    filter,
    time: READYTIME * 1000,
  });
  //THIS GUY IS NEW HERE, HE USED TO BE DOWN BELOW!
  const embed = readyEmbed(readyArray);
  await partyMessage.edit({
    content: `Ready check closes <t:${time + READYTIME}:R>`,
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
          await partyMessage.edit({
            content: `${collected
              .last()
              ?.member?.toString()} stopped the ready check. Option to Re-Check closes <t:${
              time + FIVEMINUTES
            }:R>`,
            components: [redoButton],
          });
          await redoCollector(partyMessage, confirmedPlayers, partyThread);
          return;

        default:
          await partyMessage.edit({
            content: `Ready check failed after ${READYTIME.toString()} seconds. Option to Re-Check closes <t:${
              time + FIVEMINUTES
            }:R>`,
            components: [redoButton],
          });
          await redoCollector(partyMessage, confirmedPlayers, partyThread);
          return;
      }
    } else {
      const stackButton = createButtonRow('Stack it!', 'stack');
      let finalMessage = '';
      switch (collected.last()?.customId) {
        case readyOptions.sudo:
          const readyLast = collected.last()?.member?.toString();
          finalMessage = `${readyLast} used FORCED READY! You should be safe to stack, if not blame ${readyLast}`;
          break;

        case readyOptions.rdy:
        case readyOptions.ping: //in freak cases "ping" can be the last one
          finalMessage = "Everyone's ready!";
          break;
      }
      await partyMessage.edit({
        content: finalMessage,
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
    i.channel?.id === partyMessage.channel.id && i.customId === 'redo';
  const collector = partyMessage.channel.createMessageComponentCollector({
    filter,
    time: FIVEMINUTES * 1000,
    max: 1,
  });
  collector.on('collect', async (i: CollectedInteraction) => {
    await handleIt(i, 'Again!');
  });

  collector.on(
    'end',
    async (collected: Collection<string, ButtonInteraction>) => {
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
    }
  );
}
async function pThreadCreator(
  interaction: ChatInputCommandInteraction,
  dotaMessage: Message
) {
  const partyThread = await dotaMessage.startThread({
    name: `🍹${interaction.user.username}'s Pre-Game Lounge 🍹`,
    autoArchiveDuration: 60,
    reason: 'Time for stack!',
  });
  return partyThread;
}

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
  });
  collector.on('collect', async i => {});

  collector.on('end', async collected => {
    // Gör ljud när du stackar
    // ljudGöraren.ljudGöraren(
    //   userToMember(confirmedPlayers, message),
    //   (shouldWeStackIt = true)
    // );
    await message.edit({ components: [] });
    if (collected.last()) {
      const interaction = collected.last();
      if (!(interaction instanceof ButtonInteraction))
        throw new Error('The interaction is not of type ButtonInteraction');

      let guildHasPreferences = false;
      const settingsObject = await getSettings();
      const { guildId } = interaction;
      if (!guildId) throw new Error('Somehow there is no guildI');
      if (guildId in settingsObject) {
        console.log('There is a guildid in the settings object');
        guildHasPreferences = true;
      }
      const choices = confirmedPlayers.map(cP => {
        let preferences = ['fill'];
        // if (cP.player instanceof GuildMember)
        //   throw new Error('The cp.Player is GuildMember, expected user');
        if (guildHasPreferences) {
          preferences = getPreferences(cP.player, settingsObject, guildId);
        }
        return {
          user: cP.player,
          handle: getHandle(cP.player),
          position: 'Has not picket yet',
          preferences,
          randomed: 0,
        };
      });
      const shuffledChoices = shuffle(choices);
      const { member } = interaction;
      if (!member) throw new Error('Interaction has no member!');
      if (!(member instanceof GuildMember))
        throw new Error('This is somehow the wrong guildmember object');
      // const trashChannel = await getChannelFromSettings(interaction, 'trash');
      // const stackThread = await trashChannel?.threads.create({
      //   name: interaction?.user.username + "'s Dota Party",
      //   autoArchiveDuration: 60,
      //   reason: 'Time for stack!',
      // });
      await stackSetup(interaction, shuffledChoices, standardTime, message); //FIX THIS
      // const button = linkButton(stackThread, 'Stack Thread');
      // await message.edit({
      //   content: 'Stack is running in the Stack Thread!',
      //   components: [button],
      // }); THIS GUY IS A LIE, DOES NOTHING ATM
    } else {
      await message.edit({
        content: "You actually don't seem all that ready.",
      });
    }
  });
}

async function dummySystem(
  interaction: ButtonInteraction,
  condiPlayers: ConditionalPlayer[],
  confirmedPlayers: ConfirmedPlayer[],
  dummy: GuildMember
) {
  //this is  a little busy
  const modal = new ModalBuilder()
    .setCustomId('textCollector')
    .setTitle('Ok, buddy');
  const avatarInput = new TextInputBuilder()
    .setCustomId('avatar')
    .setLabel('Which Dummy is the Dummy representing?')
    .setPlaceholder('The Dummy this Dummy is representing is...')
    .setMaxLength(140)
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
  if (!submitted) {
    await interaction.update({
      embeds: [prettyEmbed(confirmedPlayers, condiPlayers)],
    });
    return;
  }
  const representing = ` *avatar of **${submitted.fields.getTextInputValue(
    'avatar'
  )}***`;
  confirmedPlayers.push({
    player: dummy,
    representing: representing,
  });
  if (!submitted.isFromMessage())
    throw new Error("Somehow this modal isn't from a message");
  await submitted.update({
    embeds: [prettyEmbed(confirmedPlayers, condiPlayers)],
  });
}

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
      embeds: [prettyEmbed(confirmedPlayers, condiPlayers)],
    });
    return;
  }
  const time = getTimestamp(1000);
  const condition = `${submitted.fields.getTextInputValue(
    'reason'
  )} *(written <t:${time}:R>)*`;
  condiPlayers.push({ player: interaction.user, condition: condition });
  if (!submitted.isFromMessage())
    throw new Error("Somehow this modal isn't from a message");

  await submitted.update({
    embeds: [prettyEmbed(confirmedPlayers, condiPlayers)],
  });
}

function prettyEmbed(
  confirmedPlayers: ConfirmedPlayer[],
  condiPlayers: ConditionalPlayer[]
) {
  const maxLength = 5;
  const playerFields = [];
  const conditionalFields: string[] = [];
  const embedFields = [];
  for (let i = 0; i < maxLength; i++) {
    if (confirmedPlayers[i]) {
      playerFields.push(
        confirmedPlayers[i].player.toString() +
          (confirmedPlayers[i].representing || '')
      );
    } else {
      playerFields.push(`${`\`\`Open slot\`\``}`);
    }
  }
  embedFields.push({
    name: "*Who's up for Dota?*",
    value: playerFields.join('\n'),
  });

  if (condiPlayers.length > 0) {
    condiPlayers.map(e => {
      conditionalFields.push(`${e.player} ${e.condition}`);
    });
    embedFields.push({
      name: '*Conditionally In*',
      value: conditionalFields.join('\n'),
    });
  }

  const embed = {
    color: readyColours[confirmedPlayers.length as keyof typeof readyColours],
    fields: embedFields,
  };
  return embed;
}

function readyEmbed(readyArray: PlayerToReady[]) {
  const playerFields = [];
  let rAmount = 0;
  for (let player of readyArray) {
    if (player.ready) {
      rAmount++;
      playerFields.push(
        `${stringPrettifierForYapos(player.gamer.toString())} \`\`readied in ${
          player.pickTime / 1000
        }\`\`✅`
      );
    } else {
      playerFields.push(
        `${stringPrettifierForYapos(player.gamer.toString())}❌`
      );
    }
  }
  const embed = {
    color: readyColours[rAmount as keyof typeof readyColours],
    fields: [
      { name: '**R E A D Y  C H E C K**', value: playerFields.join('\n') },
    ],
  };
  return embed;
}
