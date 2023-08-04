"use strict";
// kolla om det här funkar? "use strict";
//Consistency in playerArray/updatedArray/objectArray
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const canvas_1 = __importDefault(require("@napi-rs/canvas"));
//import { request } from 'undici';
//import axios from 'axios';
//const { laggStatsBaseUrl } = require('./config.json');
const { linkButton, shuffle } = require('./utils');
const TRASH_CHANNEL = '539847809004994560';
const YAPOS_CHANNEL = '1057444797301923860';
const basePlayer = { position: 'Has not picked yet', randomed: 0 };
const standardTime = 60;
module.exports = {
    badaBing: async function badaBing(interaction, userArray, pickTime, existingThread) {
        interaction.deferReply();
        //TODO: DESIGNATE DOTA CHANNEL THING
        await interaction.deleteReply();
        const yaposThread = await interaction.member.guild.channels.cache.get(YAPOS_CHANNEL);
        const stackThread = existingThread ||
            (await interaction.member.guild.channels.cache
                .get(TRASH_CHANNEL)
                .threads.create({
                name: interaction.user.username + "'s Dota Party",
                autoArchiveDuration: 60,
                reason: 'Time to set up your dota party!',
            }));
        const message = await stackThread.send({
            content: `${playerArray.map(b => b.player).join('', ' ')}`,
        });
        if (!existingThread) {
            const button = linkButton(stackThread, 'Stack Thread');
            yaposThread.send({ components: [button] });
        }
        badaBoom(playerArray, message, pickTime);
    },
};
async function badaBoom(playerArray, message, pickTime, recentlyPicked) {
    const updatedArray = [];
    //If someone has recently picked we update the big array to include that pick
    if (recentlyPicked) {
        for (let player of playerArray) {
            if (player.player == recentlyPicked.player) {
                if (recentlyPicked.position.startsWith('pos')) {
                    const { body } = await request(player.player.user.displayAvatarURL({ extension: 'jpg' }));
                    const avatar = await body.arrayBuffer();
                    recentlyPicked.avatar = avatar;
                }
                updatedArray.push(recentlyPicked);
            }
            else {
                updatedArray.push(player);
            }
        }
    }
    else {
        updatedArray.push(...playerArray);
    }
    const available = availableRoles(updatedArray);
    const nextUp = whosNext(updatedArray);
    const buttonRows = rowBoat(nextUp, available);
    const embed = await prettyEmbed(updatedArray, nextUp);
    if (!nextUp.object) {
        await message.edit({
            content: '',
            embeds: [embed.embed],
            files: [embed.file],
            components: [],
        });
        return;
    }
    const assignedRole = appropriateRole(available, nextUp);
    const time = getTimestampInSeconds();
    const spaghettiTime = -1; //HURRY UP
    await message.edit({
        content: `${nextUp.object.player.toString()} You're up! If you do not pick you will be assigned ${assignedRole} in <t:${time + pickTime + spaghettiTime}:R>`,
        embeds: [embed.embed],
        components: buttonRows,
        files: [embed.file],
    });
    //Discord requires a filter for collectors
    //TURNS OUT THE FILTERS ARE ACTUALLY REALLY GOOD! Now we make sure we can only edit 1 embed thingy in case of multiples
    const filter = i => i.channel.id === message.channel.id;
    const collector = message.channel.createMessageComponentCollector({
        filter,
        time: pickTime * 1000,
        max: 1,
    });
    collector.on('collect', async (i) => {
        console.log(i.user.username);
        //The interaction will be "failed" unless we do something with it
        await i.deferReply();
        await i.deleteReply();
        //await i.update("Pick received...");
        //try {
        //  await i.reply("Roger, babe!");
        //  await i.deleteReply();
        //} catch (error) {
        //  console.log(error);
        //}
    });
    collector.on('end', async (collected) => {
        try {
            if (collected.last()) {
                if (collected.last().customId == 'random') {
                    const unpickedRoles = [...available];
                    //TODO: Gacha
                    //switch (true) {
                    //  case tärningen > 95:
                    //    unpickedRoles.push("☭");
                    //  case tärningen > 85:
                    //    unpickedRoles.push("Ⓐ");
                    //  case tärningen > 5:
                    //    unpickedRoles.push("fill");
                    //}
                    unpickedRoles.push('fill');
                    const recentlyPicked = {
                        player: nextUp.object.player,
                        position: shuffle(unpickedRoles)[0],
                        preferred: nextUp.object.preferred,
                        avatar: nextUp.object.avatar,
                        randomed: nextUp.object.randomed + 1,
                    };
                    badaBoom(updatedArray, message, pickTime, recentlyPicked);
                }
                else {
                    const recentlyPicked = {
                        player: nextUp.object.player,
                        position: collected.last().customId,
                        preferred: nextUp.object.preferred,
                        avatar: nextUp.object.avatar,
                        randomed: nextUp.object.randomed,
                    };
                    badaBoom(updatedArray, message, pickTime, recentlyPicked);
                }
            }
            else {
                const recentlyPicked = {
                    player: nextUp.object.player,
                    position: assignedRole,
                    preferred: nextUp.object.preferred,
                    avatar: nextUp.object.avatar,
                    randomed: nextUp.object.randomed,
                };
                badaBoom(updatedArray, message, pickTime, recentlyPicked);
            }
        }
        catch (error) {
            message.edit('There was an error baby  ' + error);
            console.log(error);
        }
    });
}
async function prettyEmbed(updatedArray, nextUp) {
    //const BLANK = "\u200b";
    const playerFields = arrayPrettifier(updatedArray).join('\n');
    const art = await artTime(updatedArray);
    if (nextUp.object) {
        const embed = {
            color: (Math.random() * 0xffffff) << 0,
            fields: [{ name: 'Picking order: ', value: playerFields }],
            image: {
                url: 'attachment://dota-map.png',
            },
        };
        const embedObject = { embed: embed, file: art };
        return embedObject;
    }
    else {
        const finalText = finalMessageMaker(updatedArray);
        const finalMessage = { text: finalText.finalMessage };
        const shortCommand = '`' + finalText.shortCommand + '`';
        const embed = {
            color: (Math.random() * 0xffffff) << 0,
            fields: [
                { name: 'Copy Code:', value: shortCommand },
                { name: 'Picking complete!', value: playerFields },
            ],
            image: {
                url: 'attachment://dota-map.png',
            },
            footer: finalMessage,
        };
        const embedObject = { embed: embed, file: art };
        return embedObject;
    }
}
function whosNext(objectArray) {
    //maybe use array.find
    for (let object of objectArray) {
        if (object.position === 'Has not picked yet') {
            return { object: object, fillFlag: false };
        }
    }
    //.slic() to make shallow copy otherwise it all goes to hell I guess
    const reversedArray = objectArray.slice().reverse();
    for (let object of reversedArray) {
        if (object.position === 'fill') {
            return { object: object, fillFlag: true };
        }
    }
    return { object: undefined, fillFlag: false };
}
function arrayPrettifier(playerArray) {
    const prettyArray = [];
    for (let player of playerArray) {
        prettyArray.push(stringPrettifier(player));
    }
    return prettyArray;
}
function stringPrettifier(player) {
    //49 is the max character count to include a max level length + all the pos stuff
    const optimalStringLength = 39;
    let playerName = String;
    if (player.player.nickname) {
        playerName = player.player.nickname.slice(0, 20);
    }
    else {
        playerName = player.player.user.username.slice(0, 20);
    }
    const neededFilling = optimalStringLength - (playerName.length + player.position.length);
    const stringFilling = ' '.repeat(neededFilling + 1 - player.randomed);
    const interrobangs = '⁉️'.repeat(player.randomed);
    return `\`\`${playerName}${stringFilling} ${player.position}${interrobangs}\`\``;
}
async function artTime(updatedArray) {
    const canvas = canvas_1.default.createCanvas(308, 308);
    const context = canvas.getContext('2d');
    const background = await canvas_1.default.loadImage('./map.png');
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    context.beginPath();
    //pos 1 circle crop
    context.arc(260, 273, 25, 0, Math.PI * 2, true);
    context.closePath();
    //pos 2 circle crop
    context.arc(150, 150, 25, 0, Math.PI * 2, true);
    context.closePath();
    //pos 3 circle crop
    context.arc(35, 50, 25, 0, Math.PI * 2, true);
    context.closePath();
    //pos 4 circle crop
    context.arc(125, 65, 25, 0, Math.PI * 2, true);
    context.closePath();
    //pos 5 circle crop
    context.arc(210, 273, 25, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();
    for (let player of updatedArray) {
        if (player.position.startsWith('pos')) {
            const avatar = await canvas_1.default.loadImage(player.avatar);
            const draw = (x, y) => context.drawImage(avatar, x, y, 50, 50);
            switch (player.position) {
                case 'pos1':
                    draw(235, 248);
                    break;
                case 'pos2':
                    draw(125, 125);
                    break;
                case 'pos3':
                    draw(10, 25);
                    break;
                case 'pos4':
                    draw(100, 40);
                    break;
                case 'pos5':
                    draw(185, 248);
                    break;
            }
        }
    }
    const attachment = new discord_js_1.AttachmentBuilder(await canvas.encode('png'), {
        name: 'dota-map.png',
    });
    return attachment;
}
function rowBoat(nextUp, available) {
    const row1 = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('pos1')
        .setLabel('1️⃣')
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(!available.includes('pos1')))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('pos2')
        .setLabel('2️⃣')
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(!available.includes('pos2')))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('pos3')
        .setLabel('3️⃣')
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(!available.includes('pos3')))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('pos4')
        .setLabel('4️⃣')
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(!available.includes('pos4')))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('pos5')
        .setLabel('5️⃣')
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(!available.includes('pos5')));
    //5 buttons/row is max for Discord, so I'm splitting them in half :)
    const row2 = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('fill')
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji('935684531023925299')
        .setDisabled(nextUp.fillFlag))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('random')
        .setLabel('⁉️')
        .setStyle(discord_js_1.ButtonStyle.Primary));
    return [row1, row2];
}
function finalMessageMaker(playerArray) {
    const finalArray = [];
    const shortArray = ['/stack'];
    let i = 1;
    for (let player of playerArray) {
        shortArray.push(`p${i}:${player.player.toString()}`);
        if (player.randomed > 0) {
            let interrobangAmount = '';
            for (let i = 0; i < player.randomed; i++) {
                interrobangAmount += '⁉️';
            }
            finalArray.push(`${player.player.user.username} ${player.position.slice(3)}${interrobangAmount}`);
        }
        else {
            finalArray.push(`${player.player.user.username} ${player.position.slice(3)}`);
        }
        i++;
    }
    const finalMessage = finalArray.join(' | ');
    const joinedArray = shortArray.join(' ');
    return { finalMessage: finalMessage, shortCommand: joinedArray };
}
function appropriateRole(available, nextUp) {
    for (let preference of nextUp.object.preferred) {
        for (let role of available) {
            if (preference == role) {
                return preference;
            }
        }
    }
    if (nextUp.fillFlag) {
        const artificialPreference = shuffle(available)[0];
        return artificialPreference;
    }
    else {
        return 'fill';
    }
}
async function getMyPreferences(discordId) {
    const res = await axios.default.post(PREF_URL, {
        aliases: [discordId],
    });
    const prefs = res.data?.[0]?.preference;
    if (prefs[0] == 'random') {
        const standardRoles = ['pos1', 'pos2', 'pos3', 'pos4', 'pos5'];
        const randomPref = shuffle(standardRoles);
        return randomPref;
    }
    for (let preference of prefs) {
        if (parseInt(preference)) {
            prefs[prefs.indexOf(preference)] = 'pos' + preference;
        }
    }
    return prefs;
}
function getTimestampInSeconds() {
    return Math.floor(Date.now() / 1000);
}
function availableRoles(objectArray) {
    const standardRoles = ['pos1', 'pos2', 'pos3', 'pos4', 'pos5'];
    for (let object of objectArray) {
        if (object.position.startsWith('pos')) {
            standardRoles.splice(standardRoles.indexOf(object.position), 1);
        }
    }
    return standardRoles;
}
//Definierar en variabel som är en anonym funktion som gör att skrivs "rita(25, 32" så kommer det funka
//const rita = (x, y) => context.drawImage(avatar, x, y, 50, 50);
