"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUp = exports.arrayMaker = void 0;
const discord_js_1 = require("discord.js");
const utilities_1 = require("./utilities");
const stacking_1 = require("../discordLogic/stacking");
const utilities_2 = require("../utils/utilities");
const standardTime = 60;
const TRASH_CHANNEL = '539847809004994560'; //shit thread
//const TRASH_CHANNEL = "1057444797301923860"; yapos thread
const ONEHOUR = 60 * 60;
const FIVEMINUTES = 5 * 60;
const READYTIME = 2 * 60;
const buttonOptions = { in: 'in', out: 'out', dummy: 'dummy', condi: 'condi' };
const readyOptions = { rdy: 'rdy', stop: 'stop', sudo: 'sudo', ping: 'ping' };
const debug = ['<@&412260353699872768>', 'test yapos'];
const yapos = debug[0];
const readyColours = {
    0: 0x000000,
    1: 0xcc3300,
    2: 0xff9900,
    3: 0xffff00,
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
const arrayMaker = (interaction) => {
    const confirmedPlayers = [];
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
exports.arrayMaker = arrayMaker;
const setUp = async (interaction, confirmedPlayers) => {
    //Embed görare
    const condiPlayers = [];
    // messageContent = await messageMaker(interaction);
    const messageToSend = {
        content: 'Placeholder text',
        embeds: [prettyEmbed(confirmedPlayers, condiPlayers)],
        components: (0, utilities_1.inOutBut)(),
    };
    const dotaMessage = await interaction.channel?.send(messageToSend);
    if (!dotaMessage)
        throw new Error("Couldn't set up new Dota Message");
    const partyThread = await pThreadCreator(interaction, dotaMessage);
    confirmedPlayers.forEach(p => partyThread.members.add(p.player));
    if (confirmedPlayers.length > 4) {
        //CHECK IF THIS IS WHERE THE BUG IS? CONSOLE LOG THAT FUCKER OUT OF ORBIT
        // ljudGöraren.ljudGöraren(userToMember(confirmedPlayers, interaction));
        readyChecker(confirmedPlayers, dotaMessage, partyThread);
        return;
    }
    const filter = (i) => i.customId in buttonOptions && i.message.id === dotaMessage.id;
    const collector = dotaMessage.channel.createMessageComponentCollector({
        filter,
        time: ONEHOUR * 1000,
    });
    console.log('setUp: on collect');
    collector.on('collect', async (i) => {
        console.log(`${i.user.username} clicked ${i.customId}`);
        switch (i.customId) {
            case buttonOptions.in:
                if (!confirmedPlayers.find((0, utilities_1.playerIdentityConfirmedPlayer)(i) || (0, utilities_1.playerIdentityGuildMember)(i))) {
                    (0, utilities_1.eRemover)(condiPlayers, i); //remove player from Condi if they're in it
                    confirmedPlayers.push({ player: i.user });
                    await partyThread.members.add(i.user);
                    if (confirmedPlayers.length > 4) {
                        collector.stop("That's enough! Collector is stopped from the switch case buttonOptions.in");
                    }
                }
                break;
            case buttonOptions.condi:
                if (!condiPlayers.find((0, utilities_1.playerIdentityConfirmedPlayer)(i) || (0, utilities_1.playerIdentityGuildMember)(i))) {
                    (0, utilities_1.eRemover)(confirmedPlayers, i); //remove player from IN if they're in it
                    await modalThing(i, condiPlayers, confirmedPlayers);
                }
                break;
            case buttonOptions.dummy:
                const dummyCollection = interaction.guild?.members.cache.filter(dummy => dummy.user.bot
                // && !confirmedPlayers.find((d: ConfirmedPlayer) => d.player == dummy)
                );
                if (!dummyCollection)
                    throw new Error('The dummy array was unable to be created!');
                const dummyArray = [...dummyCollection.values()];
                console.log('this is the dummy array', dummyArray);
                const dummy = (0, utilities_1.shuffle)(dummyArray)[0];
                if (dummy) {
                    await dummySystem(i, condiPlayers, confirmedPlayers, dummy);
                    if (confirmedPlayers.length > 4) {
                        collector.stop("That's enough! Stopping the collector from within the dummy array stuff");
                    }
                }
                break;
            case buttonOptions.out:
                (0, utilities_1.eRemover)(condiPlayers, i);
                (0, utilities_1.eRemover)(confirmedPlayers, i);
                break;
        }
        if (!i.replied) {
            await i.update({
                embeds: [prettyEmbed(confirmedPlayers, condiPlayers)],
            });
        }
    });
    console.log('setUp: on end');
    collector.on('end', async (collected) => {
        if (confirmedPlayers.length < 5) {
            await dotaMessage.edit({
                content: 'Looks like you ran out of time, darlings!',
                components: [],
            });
        }
        else {
            //Time for a ready check
            // const memberArray = userToMember(confirmedPlayers, interaction);
            // ljudGöraren.ljudGöraren(memberArray);
            console.log('Finishing and starting the ready checker from the ELSE block of the component collector');
            readyChecker(confirmedPlayers, dotaMessage, partyThread);
        }
    });
};
exports.setUp = setUp;
async function readyChecker(confirmedPlayers, partyMessage, partyThread) {
    const readyArray = [];
    const time = (0, utilities_1.getTimestamp)(1000);
    const miliTime = (0, utilities_1.getTimestamp)(1);
    for (let player of confirmedPlayers) {
        readyArray.push({ gamer: player.player, ready: false, pickTime: 0 });
    }
    const filter = (i) => i.channel?.id === partyMessage.channel.id && i.customId in readyOptions;
    const collector = partyMessage.channel.createMessageComponentCollector({
        filter,
        time: READYTIME * 1000,
    });
    collector.on('collect', async (i) => {
        const pickTime = (0, utilities_1.getTimestamp)(1);
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
                if ((0, utilities_1.everyoneReady)(readyArray)) {
                    console.log('Now stopping');
                    collector.stop("That's enough");
                }
                break;
            case readyOptions.stop:
                collector.stop('Someone wants out!');
                break;
            case readyOptions.sudo:
                (0, utilities_1.forceReady)(readyArray, pickTime, miliTime);
                collector.stop();
                break;
            case readyOptions.ping:
                await i.deferReply();
                (0, utilities_1.pingMessage)(readyArray, partyThread);
                await i.deleteReply();
                break;
        }
        if (!i.deferred) {
            await i.update({
                embeds: [readyEmbed(readyArray)],
            });
        }
    });
    collector.on('end', async (collected) => {
        console.log(`Now stopping and removing components, the final interaction was: ${collected.last() ? collected.last()?.customId : `Nothing!`}`);
        await partyMessage.edit({
            components: [],
            embeds: [readyEmbed(readyArray)],
        });
        console.log(`Everyone ready ser ut såhär: ${(0, utilities_1.everyoneReady)(readyArray)}`);
        if (!(0, utilities_1.everyoneReady)(readyArray)) {
            const time = (0, utilities_1.getTimestamp)(1000);
            const redoButton = (0, utilities_1.rowBoat)('Re-Check', 'redo');
            switch (collected.last()?.customId) {
                case readyOptions.stop:
                    await partyMessage.edit({
                        content: `${collected
                            .last()
                            ?.member?.toString()} stopped the ready check. Option to Re-Check closes <t:${time + FIVEMINUTES}:R>`,
                        components: [redoButton],
                    });
                    await redoCollector(partyMessage, confirmedPlayers, partyThread);
                    return;
                default:
                    await partyMessage.edit({
                        content: `Ready check failed after ${READYTIME.toString()} seconds. Option to Re-Check closes <t:${time + FIVEMINUTES}:R>`,
                        components: [redoButton],
                    });
                    await redoCollector(partyMessage, confirmedPlayers, partyThread);
                    return;
            }
        }
        else {
            const stackButton = (0, utilities_1.rowBoat)('Stack it!', 'stack');
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
            await stackIt(partyMessage, confirmedPlayers); //recently removed partyThread as the third argument?
        }
    });
    const embed = readyEmbed(readyArray);
    partyMessage.edit({
        content: `Ready check closes <t:${time + READYTIME}:R>`,
        embeds: [embed],
        components: (0, utilities_1.rdyButtons)(),
    });
}
async function redoCollector(partyMessage, confirmedPlayers, partyThread) {
    const filter = (i) => i.channel?.id === partyMessage.channel.id && i.customId === 'redo';
    const collector = partyMessage.channel.createMessageComponentCollector({
        filter,
        time: FIVEMINUTES * 1000,
        max: 1,
    });
    collector.on('collect', async (i) => {
        await (0, utilities_1.handleIt)(i, 'Again!');
    });
    collector.on('end', async (collected) => {
        //REMOVE THIS ANY
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
async function pThreadCreator(interaction, dotaMessage) {
    const partyThread = await dotaMessage.startThread({
        name: `🍹${interaction.user.username}'s Pre-Game Lounge 🍹`,
        autoArchiveDuration: 60,
        reason: 'Time for stack!',
    });
    return partyThread;
}
async function stackIt(message, confirmedPlayers) {
    const filter = (i) => i.message?.id === message.id && i.customId === 'stack';
    const collector = message.channel.createMessageComponentCollector({
        filter,
        time: FIVEMINUTES * 1000,
        max: 1,
    });
    collector.on('collect', async (i) => { });
    collector.on('end', async (collected) => {
        // Gör ljud när du stackar
        // ljudGöraren.ljudGöraren(
        //   userToMember(confirmedPlayers, message),
        //   (shouldWeStackIt = true)
        // );
        await message.edit({ components: [] });
        if (collected.last()) {
            const interaction = collected.last();
            if (!(interaction instanceof discord_js_1.ButtonInteraction))
                throw new Error('The interaction is not of type ButtonInteraction');
            let guildHasPreferences = false;
            const settingsObject = await (0, utilities_2.getSettings)();
            const { guildId } = interaction;
            if (!guildId)
                throw new Error('Somehow there is no guildI');
            if (guildId in settingsObject) {
                console.log('There is a guildid in the settings object');
                guildHasPreferences = true;
            }
            const choices = confirmedPlayers.map(cP => {
                let preferences = ['fill'];
                if (cP.player instanceof discord_js_1.GuildMember)
                    throw new Error('The cp.Player is GuildMember, expected user');
                if (guildHasPreferences) {
                    preferences = (0, utilities_2.getPreferences)(cP.player, settingsObject, guildId);
                }
                return {
                    user: cP.player,
                    position: 'Has not picket yet',
                    preferences: preferences,
                    randomed: 0,
                };
            }); //badaBing (now called stackSetup) takes an array of player IDs, not player objects
            const shuffledChoices = (0, utilities_1.shuffle)(choices);
            const { member } = interaction;
            if (!member)
                throw new Error('Interaction has no member!');
            if (!(member instanceof discord_js_1.GuildMember))
                throw new Error('This is somehow the wrong guildmember object');
            const channel = member.guild.channels.cache.get(TRASH_CHANNEL);
            if (channel?.type !== discord_js_1.ChannelType.GuildText)
                throw new Error('The trash channel was not a text channel!');
            const stackThread = await channel?.threads.create({
                name: interaction?.user.username + "'s Dota Party",
                autoArchiveDuration: 60,
                reason: 'Time for stack!',
            });
            await (0, stacking_1.stackSetup)(interaction, shuffledChoices, standardTime); //FIX THIS
            const button = (0, utilities_1.linkButton)(stackThread, 'Stack Thread');
            await message.edit({
                content: 'Stack is running in the Stack Thread!',
                components: [button],
            });
        }
        else {
            await message.edit({
                content: "You actually don't seem all that ready.",
            });
        }
    });
}
async function dummySystem(interaction, condiPlayers, confirmedPlayers, dummy) {
    //this is  a little busy
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId('textCollector')
        .setTitle('Ok, buddy');
    const avatarInput = new discord_js_1.TextInputBuilder()
        .setCustomId('avatar')
        .setLabel('Which Dummy is the Dummy representing?')
        .setPlaceholder('The Dummy this Dummy is representing is...')
        .setMaxLength(140)
        .setStyle(discord_js_1.TextInputStyle.Short);
    const modalInput = (0, utilities_1.modalComponent)(avatarInput);
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
    const representing = ` *avatar of **${submitted.fields.getTextInputValue('avatar')}***`;
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
async function modalThing(interaction, condiPlayers, confirmedPlayers) {
    //this is  a little busy
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId('textCollector')
        .setTitle('Ok, buddy');
    const reasonInput = new discord_js_1.TextInputBuilder()
        .setCustomId('reason')
        .setLabel("What's the holdup? Include ETA")
        .setPlaceholder("Describe what's stopping you from being IN RIGHT NOW")
        .setMaxLength(140)
        .setStyle(discord_js_1.TextInputStyle.Short);
    const modalInput = (0, utilities_1.modalComponent)(reasonInput);
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
    const time = (0, utilities_1.getTimestamp)(1000);
    const condition = `${submitted.fields.getTextInputValue('reason')} *(written <t:${time}:R>)*`;
    condiPlayers.push({ player: interaction.user, condition: condition });
    if (!submitted.isFromMessage())
        throw new Error("Somehow this modal isn't from a message");
    await submitted.update({
        embeds: [prettyEmbed(confirmedPlayers, condiPlayers)],
    });
}
function prettyEmbed(confirmedPlayers, condiPlayers) {
    const maxLength = 5;
    const playerFields = [];
    const conditionalFields = [];
    const embedFields = [];
    for (let i = 0; i < maxLength; i++) {
        if (confirmedPlayers[i]) {
            playerFields.push(confirmedPlayers[i].player.toString() +
                (confirmedPlayers[i].representing || ''));
        }
        else {
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
        color: readyColours[confirmedPlayers.length],
        fields: embedFields,
    };
    return embed;
}
function readyEmbed(readyArray) {
    const playerFields = [];
    let rAmount = 0;
    for (let player of readyArray) {
        if (player.ready) {
            rAmount++;
            playerFields.push(`${(0, utilities_1.stringPrettifier)(player.gamer.toString())} \`\`readied in ${player.pickTime / 1000}\`\`✅`);
        }
        else {
            playerFields.push(`${(0, utilities_1.stringPrettifier)(player.gamer.toString())}❌`);
        }
    }
    const embed = {
        color: readyColours[rAmount],
        fields: [
            { name: '**R E A D Y  C H E C K**', value: playerFields.join('\n') },
        ],
    };
    return embed;
}
