import {
  ButtonInteraction,
  GuildMember,
  ThreadChannel,
  CollectedInteraction,
} from 'discord.js';
import { ConfirmedPlayer, PlayerToReady, Dummy } from '../../utils/types';

// import axios from 'axios';

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

export const createDummy = (name: string): Dummy => ({
  name,
  id: name,
  username: name,
  user: { username: name },
  displayAvatarURL: () => 'https://laggan.online/foppa.gif',
  isDummy: true,
});

export const removeFromArray = (
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
  const reminders = [];
  for (let player of readyArray) {
    if (!player.ready) {
      const gentleReminder = await partyThread.send(
        `${player.gamer.toString()} hurry up, we're waiting!}`
      );
      reminders.push(gentleReminder);
    }
  }
  reminders.map(async message => await message.delete());
};
