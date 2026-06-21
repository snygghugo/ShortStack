import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Message,
} from 'discord.js';
import { getNickname } from './getters';

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

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

export const parsePrefsForEmbed = (pos: string) => {
  switch (pos) {
    case 'pos1':
      return '1️⃣';
    case 'pos2':
      return '2️⃣';
    case 'pos3':
      return '3️⃣';
    case 'pos4':
      return '4️⃣';
    case 'pos5':
      return '5️⃣';
    default:
      return 'No /preferences set!';
  }
};

export const pThreadCreator = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  dotaMessage: Message
) => {
  const creatorName = await getNickname(interaction, interaction.user);
  const partyThread = await dotaMessage.startThread({
    name: `🍹${creatorName}'s Pre-Game Lounge 🍹`,
    autoArchiveDuration: 60,
    reason: 'Time for stack!',
  });
  return partyThread;
};
