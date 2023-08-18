import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  CollectedInteraction,
  Message,
} from 'discord.js';
import { PlayerObject } from '../../utils/types';

export const strictPicking = (
  i: CollectedInteraction,
  message: Message,
  nextUp: PlayerObject,
  interaction: ChatInputCommandInteraction | ButtonInteraction
) => {
  const interactor = i.user;
  const stackCreator = interaction.user;
  console.log('this is the interactor', interactor.username);
  console.log('this is the stackCreator', stackCreator.username);
  console.log('this is the one who should be clicking', nextUp.user.username);
  if ('isDummy' in nextUp.user || i.user.bot) {
    console.log('this one has isDummy in nextUp, so anything goes');
    return true;
  }
  if (interactor.id === stackCreator.id) {
    console.log('The creator can do what they want');
    return true;
  }

  if (interactor.id === nextUp.user.id) {
    console.log('This is an appropriate person to pick');
    return true;
  }
  console.log('This is not an appropriate person to pick');
  return false;
};
