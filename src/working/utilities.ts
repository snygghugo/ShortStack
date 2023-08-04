import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  GuildMember,
  TextInputBuilder,
  ThreadChannel,
  CollectedInteraction,
} from 'discord.js';
import { ConfirmedPlayer, PlayerToReady } from './types';
// import axios from 'axios';

const REMINDERS = [
  ' TAKING OUR SWEET TIME, HUH?',
  ' **JALLA, BITCH!**',
  ' CHOP CHOP!',
  ' NU SKET DU ALLT I DET BLÅ SKÅPET',
  ' Hur lång tid kan det ta...',
  " WHAT'S TAKING YOU???",
  " THIS GAME AIN'T GONNA THROW ITSELF",
  ' A LITTLE LESS CONVERSATION, A LITTLE MORE ACTION PLEASE',
  ' LESS TALK, MORE COCK',
  ' LESS STALL, MORE /STACK',
  ' POOP FASTER!!!',
  ' ***TODAY MB???***',
];

const buttonDict = {
  primary: ButtonStyle.Primary,
};

// const playerIdentity = (interaction: ChatInputCommandInteraction) => {
//   return (e: GuildMember | ConfirmedPlayer) =>
//     [e?.id, e.player?.id].includes(interaction.user.id);
// };

export const playerIdentityGuildMember =
  (interaction: ButtonInteraction | ButtonInteraction) =>
  (member: GuildMember) =>
    member.id === interaction.user.id;

export const playerIdentityConfirmedPlayer =
  (interaction: ButtonInteraction | ButtonInteraction) =>
  (confirmedPlayer: ConfirmedPlayer) =>
    confirmedPlayer.player.id === interaction.user.id;

export const playerIdentity = (
  interaction: ButtonInteraction | ButtonInteraction
) =>
  playerIdentityGuildMember(interaction) ||
  playerIdentityConfirmedPlayer(interaction);

export const shuffle = <Type>(array: Type[]): Type[] => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};
type ShortButtonConf = {
  id: string;
  label: string;
  style: string;
};
export const shortButton = ({ id, label, style }: ShortButtonConf) => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(id)
      .setLabel(label)
      .setStyle(buttonDict[style as keyof typeof buttonDict])
  );
};

// export const helpMeLittleHelper = async (queuer, method: string) => {
//   const request = {
//     method: method,
//     baseURL: 'http://localhost:3000/',
//     url: 'queue',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     data: queuer,
//     responseType: 'json',
//   };
//   try {
//     const res = await axios(request);
//     return res;
//     //switch (method){
//     //case "post":
//     //postRes = await axios.post(request);
//     //return postRed
//     //break;
//     //case "delete":
//     //deleteRes = await axios.delete(request);
//     //return deleteRes
//     //break;
//     //case "get":
//     //getRes = await axios.get(request);
//     //return getRes
//     //break;
//     //}
//   } catch (error) {
//     console.error(error);
//   }
// };

export const stringPrettifier = (string: string) => {
  const optimalStringLength = 39;
  const neededFilling = optimalStringLength - string.length;
  const stringFilling = '\u200b'.repeat(neededFilling + 1);
  return `${string}${stringFilling}`;
};

export const rowBoat = (btnText: string, btnId: string) => {
  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(btnId)
      .setLabel(btnText)
      .setStyle(ButtonStyle.Secondary)
  );
  return buttonRow;
};

export const linkButton = (thread: ThreadChannel, label: string) => {
  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setURL(`https://discord.com/channels/${thread.guild.id}/${thread.id}`)
      .setLabel(label)
      .setStyle(ButtonStyle.Link)
  );
  return buttonRow;
};

export const inOutBut = () => {
  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('in')
        .setLabel("I'M IN")
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId('out')
        .setLabel("I'M OUT")
        .setStyle(ButtonStyle.Danger)
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('dummy')
        .setLabel('Dummy')
        .setStyle(ButtonStyle.Primary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId('condi')
        .setLabel("I'm In, but (...)")
        .setStyle(ButtonStyle.Secondary)
    );
  return [row1, row2];
};

export const rdyButtons = () => {
  const buttonRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('rdy')
        .setLabel('✅')
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId('stop')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
    );
  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('sudo')
        .setLabel('FORCE READY')
        .setStyle(ButtonStyle.Primary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId('ping')
        .setLabel('Ping')
        .setStyle(ButtonStyle.Secondary)
    );
  return [buttonRow, row2];
};

export const eRemover = (
  array: ConfirmedPlayer[] | ConfirmedPlayer[],
  interaction: ButtonInteraction
) => {
  // const index = array.findIndex(playerIdentity(interaction));
  const index = array.findIndex(
    playerIdentityConfirmedPlayer(interaction) ||
      playerIdentityGuildMember(interaction)
  );
  if (index > -1) {
    array.splice(index, 1); //Return the array instead probably
    return true;
  } else {
    return false;
  }
};

// export const userToMember = (
//   array: User[],
//   interaction: ChatInputCommandInteraction
// ) => {
//   const memberArray = [];
//   for (let user of array) {
//     const member = interaction.guild?.members.cache.find(
//       member => member.id === user.player.id
//     );
//     memberArray.push(member);
//   }
//   return memberArray;
// };

export const getTimestamp = (mod: number) => {
  return Math.floor(Date.now() / mod);
};

export const modalComponent = (reasonInput: TextInputBuilder) => {
  return new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
};

export const handleIt = async (
  i: CollectedInteraction,
  flavourText: string
) => {
  try {
    console.log('Handling it!');
    await i.reply(flavourText);
    await i.deleteReply();
  } catch (error) {
    console.log(error);
  }
};

export const forceReady = (
  readyArray: PlayerToReady[],
  pickTime: number,
  miliTime: number
) => {
  for (const player of readyArray) {
    if (!player.ready) {
      player.ready = true;
      player.pickTime = pickTime - miliTime;
    }
  }
};

export const everyoneReady = (readyArray: PlayerToReady[]) => {
  return readyArray.filter(p => p.ready).length > 4;
};

export const pingMessage = async (
  readyArray: PlayerToReady[],
  partyThread: ThreadChannel
) => {
  const shitList = [];
  for (let player of readyArray) {
    if (!player.ready) {
      const gentleReminder = await partyThread.send(
        `${player.gamer.toString()}${shuffle(REMINDERS)[0]}`
      );
      shitList.push(gentleReminder);
    }
  }
  shitList.map(async message => await message.delete());
};
