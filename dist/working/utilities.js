"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pingMessage = exports.everyoneReady = exports.forceReady = exports.handleIt = exports.modalComponent = exports.getTimestamp = exports.eRemover = exports.rdyButtons = exports.inOutBut = exports.linkButton = exports.rowBoat = exports.stringPrettifier = exports.shortButton = exports.shuffle = exports.playerIdentity = exports.playerIdentityConfirmedPlayer = exports.playerIdentityGuildMember = void 0;
const discord_js_1 = require("discord.js");
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
    primary: discord_js_1.ButtonStyle.Primary,
};
// const playerIdentity = (interaction: ChatInputCommandInteraction) => {
//   return (e: GuildMember | ConfirmedPlayer) =>
//     [e?.id, e.player?.id].includes(interaction.user.id);
// };
const playerIdentityGuildMember = (interaction) => (member) => member.id === interaction.user.id;
exports.playerIdentityGuildMember = playerIdentityGuildMember;
const playerIdentityConfirmedPlayer = (interaction) => (confirmedPlayer) => confirmedPlayer.player.id === interaction.user.id;
exports.playerIdentityConfirmedPlayer = playerIdentityConfirmedPlayer;
const playerIdentity = (interaction) => (0, exports.playerIdentityGuildMember)(interaction) ||
    (0, exports.playerIdentityConfirmedPlayer)(interaction);
exports.playerIdentity = playerIdentity;
const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
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
exports.shuffle = shuffle;
const shortButton = ({ id, label, style }) => {
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(id)
        .setLabel(label)
        .setStyle(buttonDict[style]));
};
exports.shortButton = shortButton;
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
const stringPrettifier = (string) => {
    const optimalStringLength = 39;
    const neededFilling = optimalStringLength - string.length;
    const stringFilling = '\u200b'.repeat(neededFilling + 1);
    return `${string}${stringFilling}`;
};
exports.stringPrettifier = stringPrettifier;
const rowBoat = (btnText, btnId) => {
    const buttonRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(btnId)
        .setLabel(btnText)
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    return buttonRow;
};
exports.rowBoat = rowBoat;
const linkButton = (thread, label) => {
    const buttonRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setURL(`https://discord.com/channels/${thread.guild.id}/${thread.id}`)
        .setLabel(label)
        .setStyle(discord_js_1.ButtonStyle.Link));
    return buttonRow;
};
exports.linkButton = linkButton;
const inOutBut = () => {
    const row1 = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('in')
        .setLabel("I'M IN")
        .setStyle(discord_js_1.ButtonStyle.Success))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('out')
        .setLabel("I'M OUT")
        .setStyle(discord_js_1.ButtonStyle.Danger));
    const row2 = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('dummy')
        .setLabel('Dummy')
        .setStyle(discord_js_1.ButtonStyle.Primary))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('condi')
        .setLabel("I'm In, but (...)")
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    return [row1, row2];
};
exports.inOutBut = inOutBut;
const rdyButtons = () => {
    const buttonRow = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('rdy')
        .setLabel('✅')
        .setStyle(discord_js_1.ButtonStyle.Success))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('stop')
        .setLabel('Cancel')
        .setStyle(discord_js_1.ButtonStyle.Danger));
    const row2 = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('sudo')
        .setLabel('FORCE READY')
        .setStyle(discord_js_1.ButtonStyle.Primary))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('ping')
        .setLabel('Ping')
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    return [buttonRow, row2];
};
exports.rdyButtons = rdyButtons;
const eRemover = (array, interaction) => {
    // const index = array.findIndex(playerIdentity(interaction));
    const index = array.findIndex((0, exports.playerIdentityConfirmedPlayer)(interaction) ||
        (0, exports.playerIdentityGuildMember)(interaction));
    if (index > -1) {
        array.splice(index, 1); //Return the array instead probably
        return true;
    }
    else {
        return false;
    }
};
exports.eRemover = eRemover;
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
const getTimestamp = (mod) => {
    return Math.floor(Date.now() / mod);
};
exports.getTimestamp = getTimestamp;
const modalComponent = (reasonInput) => {
    return new discord_js_1.ActionRowBuilder().addComponents(reasonInput);
};
exports.modalComponent = modalComponent;
const handleIt = async (i, flavourText) => {
    try {
        console.log('Handling it!');
        await i.reply(flavourText);
        await i.deleteReply();
    }
    catch (error) {
        console.log(error);
    }
};
exports.handleIt = handleIt;
const forceReady = (readyArray, pickTime, miliTime) => {
    for (const player of readyArray) {
        if (!player.ready) {
            player.ready = true;
            player.pickTime = pickTime - miliTime;
        }
    }
};
exports.forceReady = forceReady;
const everyoneReady = (readyArray) => {
    return readyArray.filter(p => p.ready).length > 4;
};
exports.everyoneReady = everyoneReady;
const pingMessage = async (readyArray, partyThread) => {
    const shitList = [];
    for (let player of readyArray) {
        if (!player.ready) {
            const gentleReminder = await partyThread.send(`${player.gamer.toString()}${(0, exports.shuffle)(REMINDERS)[0]}`);
            shitList.push(gentleReminder);
        }
    }
    shitList.map(async (message) => await message.delete());
};
exports.pingMessage = pingMessage;
