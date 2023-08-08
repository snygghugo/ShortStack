import { Message, User, MessageReaction } from 'discord.js';
import { prefEmbedMaker } from '../../utils/view';
import { tsCompliantIncludes } from '../../utils/generalUtilities';
const emojiDict = {
  '1️⃣': 'pos1',
  '2️⃣': 'pos2',
  '3️⃣': 'pos3',
  '4️⃣': 'pos4',
  '5️⃣': 'pos5',
} as { [emoji: string]: string };
const emojiRoles = Object.keys(emojiDict);

export const reactionCollector = async (
  message: Message,
  interactionUser: User
) => {
  emojiRoles.forEach(async emoji => await message.react(emoji));
  const emojiCopy = [...emojiRoles];
  const chosenRoles: string[] = [];

  const filter = (reaction: MessageReaction, user: User) =>
    tsCompliantIncludes(emojiCopy, reaction.emoji.name) &&
    user.id === interactionUser.id;

  const collector = message.createReactionCollector({
    filter,
    max: 5,
    time: 5 * 60000,
  });

  collector.on('collect', async (reaction, user) => {
    if (!reaction.emoji.name) {
      console.error('Reaction seems weird', reaction);
      return;
    }
    const reactionToRemove = message.reactions.cache.get(reaction.emoji.name);
    if (!reactionToRemove) {
      console.error(
        "Couldn't find this emoji in reactions",
        reaction.emoji.name
      );
      return;
    }

    emojiCopy.splice(emojiCopy.indexOf(reaction.emoji.name), 1);
    chosenRoles.push(reaction.emoji.name);
    try {
      message.edit({ embeds: [prefEmbedMaker(chosenRoles)] });
      reactionToRemove.remove();
    } catch (error) {
      console.error('Failed to remove reactions:', error);
    }
  });
  await new Promise((res, rej) => {
    collector.on('end', collected => {
      console.log('We are finished! ', collected.size);
      res(collected);
    });
  });
  return chosenRoles.map(emoji => emojiDict[emoji]);
};
