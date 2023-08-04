"use strict";
//Consistency in playerArray/updatedArray/objectArray
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stackSetup = void 0;
const discord_js_1 = require("discord.js");
const canvas_1 = __importDefault(require("@napi-rs/canvas"));
const utilities_1 = require("../utils/utilities");
const undici_1 = require("undici");
const utilities_2 = require("../utils/utilities");
const getAppropriateChannel = async (interaction) => {
    if (!interaction.guildId)
        throw new Error('GuildId Issues');
    if (!interaction.channel?.id)
        throw new Error('ChannelID issues');
    const settings = await (0, utilities_1.getSettings)();
    let whereToPost = interaction.guild?.channels.cache.get(interaction.channel?.id);
    const yaposChannel = settings[interaction.guildId]?.yaposChannel;
    if (yaposChannel) {
        whereToPost = interaction.guild?.channels.cache.get(yaposChannel);
    }
    return whereToPost;
};
// module.exports = {
const stackSetup = async (interaction, playerArray, pickTime) => {
    interaction.deferReply();
    if (!interaction.guildId)
        throw new Error('GuildId Issues');
    interaction.deleteReply();
    const channel = await getAppropriateChannel(interaction);
    const message = await channel.send('Setting up the beauty...');
    message.startThread({
        name: `🍹${interaction.user.username}'s Pre-Game Lounge 🍹`,
        autoArchiveDuration: 60,
        reason: 'Time for stack!',
    });
    stackExecute(playerArray, message, pickTime, interaction);
};
exports.stackSetup = stackSetup;
// };
const updateArray = async (playerArray, recentlyPicked) => {
    if (!recentlyPicked)
        return playerArray;
    const updatedArray = [];
    for (let player of playerArray) {
        if (player.user !== recentlyPicked.user) {
            updatedArray.push(player);
            continue;
        }
        if (!recentlyPicked.position.startsWith('pos')) {
            updatedArray.push(recentlyPicked);
            continue;
        }
        const { body } = await (0, undici_1.request)(player.user.displayAvatarURL({ extension: 'jpg' }));
        const avatar = await body.arrayBuffer();
        recentlyPicked.avatar = avatar;
        updatedArray.push(recentlyPicked);
    }
    return updatedArray;
};
async function stackExecute(playerArray, message, pickTime, interaction, recentlyPicked) {
    const updatedArray = await updateArray(playerArray, recentlyPicked);
    const available = availableRoles(updatedArray);
    const nextUp = whosNext(updatedArray);
    const buttonRows = rowBoat(nextUp, available);
    const embed = await prettyEmbed(updatedArray, nextUp, interaction);
    if (!nextUp) {
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
        content: `${nextUp.user.toString()} You're up! If you do not pick you will be assigned ${assignedRole} in <t:${time + pickTime + spaghettiTime}:R>`,
        embeds: [embed.embed],
        components: buttonRows,
        files: [embed.file],
    });
    const filter = (i) => i.channel?.id === message.channel.id;
    const collector = message.channel.createMessageComponentCollector({
        filter,
        time: pickTime * 1000,
        max: 1,
    });
    collector.on('collect', async (i) => {
        console.log(i.user.username +
            ' clicked ' +
            i.customId +
            ' for ' +
            nextUp.user.username);
        await i.deferReply();
        await i.deleteReply();
    });
    collector.on('end', async (collected) => {
        try {
            const last = collected.last();
            if (!last?.customId) {
                console.log(`Autopicked picked ${assignedRole} for ${nextUp.user}`);
                const recentlyPicked = {
                    user: nextUp.user,
                    position: assignedRole,
                    preferences: nextUp.preferences,
                    avatar: nextUp.avatar,
                    randomed: nextUp.randomed,
                };
                stackExecute(updatedArray, message, pickTime, interaction, recentlyPicked);
                return;
            }
            if (last.customId !== 'random') {
                const recentlyPicked = {
                    user: nextUp.user,
                    position: last.customId,
                    preferences: nextUp.preferences,
                    avatar: nextUp.avatar,
                    randomed: nextUp.randomed,
                };
                stackExecute(updatedArray, message, pickTime, interaction, recentlyPicked);
                return;
            }
            const unpickedRoles = [...available];
            unpickedRoles.push('fill');
            const recentlyPicked = {
                user: nextUp.user,
                position: (0, utilities_2.shuffle)(unpickedRoles)[0],
                preferences: nextUp.preferences,
                avatar: nextUp.avatar,
                randomed: nextUp.randomed + 1,
            };
            stackExecute(updatedArray, message, pickTime, interaction, recentlyPicked);
            return;
        }
        catch (error) {
            message.edit('There was an error baby  ' + error);
            console.log(error);
        }
    });
}
async function prettyEmbed(playerArray, nextUp, interaction) {
    const playerFields = [];
    playerArray.forEach(async (player) => {
        const member = await interaction.guild?.members.fetch(player.user.id);
        if (!member)
            throw new Error('Issues making a member!');
        playerFields.push(stringPrettifier(player, member));
    });
    const art = await artTime(playerArray);
    if (nextUp) {
        const embed = {
            color: (Math.random() * 0xffffff) << 0,
            fields: [{ name: 'Picking order: ', value: playerFields.join('\n') }],
            image: {
                url: 'attachment://dota-map.png',
            },
        };
        const embedObject = { embed: embed, file: art };
        return embedObject;
    }
    const finalText = finalMessageMaker(playerArray);
    const finalMessage = { text: finalText.finalMessage };
    const shortCommand = '`' + finalText.shortCommand + '`';
    const embed = {
        color: (Math.random() * 0xffffff) << 0,
        fields: [
            { name: 'Copy Code:', value: shortCommand },
            { name: 'Picking complete!', value: playerFields.join('\n') },
        ],
        image: {
            url: 'attachment://dota-map.png',
        },
        footer: finalMessage,
    };
    const embedObject = { embed: embed, file: art };
    return embedObject;
}
function whosNext(playerArray) {
    const unpickedPlayer = playerArray.find(player => player.position.startsWith('Has'));
    if (unpickedPlayer)
        return Object.assign({ fillFlag: false }, unpickedPlayer);
    //THIS WAY OF COPYING MIGHT GET FUCKED
    const reversedArray = [...playerArray].reverse();
    const filledPlayer = reversedArray.find(player => player.position === 'fill');
    if (filledPlayer)
        return Object.assign({ fillFlag: true }, filledPlayer);
    return null;
}
const userToMember = async (player, interaction) => {
    return await interaction.guild?.members.fetch(player.user.id);
};
//ALL OF THIS MAYBE REDONE SO THAT IT WORKS WITH NICKNAMES?
function stringPrettifier(player, member) {
    //39 is the max character count to include a max level length + all the pos stuff
    const optimalStringLength = 39;
    let playerName = player.user.username.slice(0, 20);
    if (member.nickname) {
        playerName = member.nickname.slice(0, 20);
    }
    const neededFilling = optimalStringLength - (playerName.length + player.position.length);
    const stringFilling = ' '.repeat(neededFilling + 1 - player.randomed);
    const interrobangs = '⁉️'.repeat(player.randomed);
    return `\`\`${playerName}${stringFilling} ${player.position}${interrobangs}\`\``;
}
async function artTime(playerArray) {
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
    for (let player of playerArray) {
        if (player.avatar) {
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
    }
    return new discord_js_1.AttachmentBuilder(await canvas.encode('png'), {
        name: 'dota-map.png',
    });
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
        .setDisabled(nextUp?.fillFlag))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId('random')
        .setLabel('⁉️')
        .setStyle(discord_js_1.ButtonStyle.Primary));
    //Wtf
    return [row1, row2];
}
function finalMessageMaker(playerArray) {
    const finalArray = [];
    const shortArray = ['/stack'];
    for (const i in playerArray) {
        const player = playerArray[i];
        shortArray.push(`p${i + 1}:${player.user.toString()}`);
        if (player.randomed > 0) {
            let interrobangAmount = '';
            for (let i = 0; i < player.randomed; i++) {
                interrobangAmount += '⁉️';
            }
            finalArray.push(`${player.user.username} ${player.position.slice(3)}${interrobangAmount}`);
            continue;
        }
        finalArray.push(`${player.user.username} ${player.position.slice(3)}`);
    }
    const finalMessage = finalArray.join(' | ');
    const joinedArray = shortArray.join(' ');
    return { finalMessage: finalMessage, shortCommand: joinedArray };
}
function appropriateRole(available, nextUp) {
    const foundPreference = nextUp.preferences.find(preference => available.includes(preference));
    if (foundPreference)
        return foundPreference;
    if (!nextUp.fillFlag) {
        return 'fill';
    }
    return (0, utilities_2.shuffle)(available)[0];
}
function getTimestampInSeconds() {
    return Math.floor(Date.now() / 1000);
}
function availableRoles(playerArray) {
    const standardRoles = ['pos1', 'pos2', 'pos3', 'pos4', 'pos5'];
    for (let object of playerArray) {
        if (object.position.startsWith('pos')) {
            standardRoles.splice(standardRoles.indexOf(object.position), 1);
        }
    }
    return standardRoles;
}
//Definierar en variabel som är en anonym funktion som gör att skrivs "rita(25, 32" så kommer det funka
//const rita = (x, y) => context.drawImage(avatar, x, y, 50, 50);
