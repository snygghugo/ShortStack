import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  CollectedInteraction,
} from 'discord.js';
import { PlayerObject } from '../../utils/types';

export const strictPicking = (
  i: CollectedInteraction,
  nextUp: PlayerObject,
  interaction: ChatInputCommandInteraction | ButtonInteraction
) => {
  const interactor = i.user;
  const stackCreator = interaction.user;
  const expectedInteractor = nextUp.user;
  console.log('this is i.user.bot', i.user.bot);
  if ('isDummy' in nextUp.user || i.user.bot) {
    //TODO: explore why the i.user.bot thing doesn't seem to work
    console.log('this one has isDummy in nextUp, so anything goes');
    return true;
  }
  if (interactor.id === stackCreator.id) {
    return true;
  }
  if (interactor.id === expectedInteractor.id) {
    return true;
  }
  return false;
};
